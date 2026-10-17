import { binToHex, cashAddressToLockingBytecode, decodeCashAddress } from '@bitauth/libauth';

import { BitcoinCash } from '@rosen-bridge/icons';
import type { TokenMap } from '@rosen-bridge/tokens';
import type { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type {
  BitcoinCashUnsignedLock,
  BitcoinCashUnsignedLockRequest,
} from './generateUnsignedTx.js';
import type { BitcoinCashLockMetadata } from './metadata.js';
import { validateBitcoinCashSignedLock } from './validateSignedTx.js';

/** Browser request fields; treasury, fee policy and UTXOs come from server configuration. */
export type BitcoinCashDepositRequest = BitcoinCashLockMetadata & {
  fromAddress: string;
  amount: bigint;
};

/** Real server-action ports; browser configuration carries no Electrum or RPC credentials. */
export interface BitcoinCashNetworkConfig extends NetworkConfig {
  getTokenMap(): Promise<TokenMap>;
  getAddressBalance(address: string): Promise<bigint>;
  generateSigningParameters(
    request: BitcoinCashDepositRequest,
  ): Promise<BitcoinCashUnsignedLockRequest>;
  submitTransaction(
    signedHex: string,
    intent: BitcoinCashUnsignedLock,
    expectedMetadata: BitcoinCashLockMetadata,
    signal?: AbortSignal,
  ): Promise<string>;
}

/** Validate an ordinary native mainnet P2PKH address before using server-action ports. */
const nativeAddress = (value: string): string => {
  if (
    typeof value !== 'string' ||
    value.length > 100 ||
    value !== value.toLowerCase() ||
    !value.startsWith('bitcoincash:')
  )
    throw new Error('Invalid native BCH address');
  const decoded = cashAddressToLockingBytecode(value);
  const cash = decodeCashAddress(value);
  if (
    typeof cash === 'string' ||
    cash.type !== 'p2pkh' ||
    typeof decoded === 'string' ||
    decoded.prefix !== 'bitcoincash' ||
    !/^76a914[0-9a-f]{40}88ac$/.test(binToHex(decoded.bytecode))
  )
    throw new Error('BCH custody requires native P2PKH');
  return value;
};

/** Copy bounded primitive intent/parent fields before asynchronous server-action boundaries. */
const snapshotIntent = (intent: BitcoinCashUnsignedLock): BitcoinCashUnsignedLock => {
  if (
    !Array.isArray(intent.selectedUtxos) ||
    intent.selectedUtxos.length < 1 ||
    intent.selectedUtxos.length > 100
  )
    throw new Error('Invalid BCH signing context');
  let characters = 0;
  const selectedUtxos = intent.selectedUtxos.map((utxo) => {
    if (typeof utxo.parentTransactionHex !== 'string')
      throw new Error('Invalid BCH signing context');
    characters += utxo.parentTransactionHex.length;
    if (characters > 4_000_000) throw new Error('Invalid BCH signing context');
    return Object.freeze({
      txId: utxo.txId,
      index: utxo.index,
      value: utxo.value,
      scriptPubKey: utxo.scriptPubKey,
      parentTransactionHex: utxo.parentTransactionHex,
      height: utxo.height,
      confirmations: utxo.confirmations,
      coinbase: utxo.coinbase,
    });
  });
  return Object.freeze({
    unsignedTransactionHex: intent.unsignedTransactionHex,
    selectedUtxos: Object.freeze(selectedUtxos),
    fee: intent.fee,
    amount: intent.amount,
    fromAddress: intent.fromAddress,
    lockAddress: intent.lockAddress,
  });
};

/** Native BCH Network consumer backed by explicitly supplied server actions. */
export class BitcoinCashNetwork implements Network {
  readonly name = NETWORKS['bitcoin-cash'].key;
  readonly label = NETWORKS['bitcoin-cash'].label;
  readonly logo = BitcoinCash;
  readonly lockAddress: string;
  readonly nextHeightInterval: number;

  /**
   * Construct a client only after index assignment and complete server-action wiring.
   * @param config Complete operator configuration and real server-action functions.
   * @throws For an unassigned chain index, invalid treasury, height interval or missing port.
   */
  constructor(private readonly config: BitcoinCashNetworkConfig) {
    if (NETWORKS['bitcoin-cash'].index < 0) throw new Error('BCH chain index is unassigned');
    this.lockAddress = nativeAddress(config.lockAddress);
    if (!Number.isSafeInteger(config.nextHeightInterval) || config.nextHeightInterval < 1)
      throw new Error('Invalid BCH next-height interval');
    for (const method of [
      'calculateFee',
      'getTokenMap',
      'getMaxTransfer',
      'getMinTransfer',
      'validateAddress',
      'getAddressBalance',
      'generateSigningParameters',
      'submitTransaction',
    ] as const) {
      if (typeof config[method] !== 'function') throw new Error('Missing BCH server-action port');
    }
    this.nextHeightInterval = config.nextHeightInterval;
  }

  /** Delegate current/next Rosen fees to the configured server calculation. */
  calculateFee: BitcoinCashNetworkConfig['calculateFee'] = (...parameters) =>
    this.config.calculateFee(...parameters);
  /** Delegate native maximum transfer to authenticated UTXO and shared fee calculations. */
  getMaxTransfer: BitcoinCashNetworkConfig['getMaxTransfer'] = (parameters) =>
    parameters.isNative ? this.config.getMaxTransfer(parameters) : Promise.resolve(0n);
  /** Delegate native minimum transfer to trusted Rosen fees and dust constraints. */
  getMinTransfer: BitcoinCashNetworkConfig['getMinTransfer'] = async (token, ...parameters) => {
    if (token.type !== 'native' || token.tokenId !== 'bch' || token.decimals !== 8)
      throw new Error('BCH supports only native eight-decimal assets');
    return this.config.getMinTransfer(token, ...parameters);
  };
  /** Preserve canonical native addresses rather than converting to a token-aware form. */
  toSafeAddress = (value: string): string => nativeAddress(value);
  /** Check an ordinary destination through the server's shared address validator. */
  validateAddress = (value: string): Promise<boolean> =>
    this.config.validateAddress(this.name, value);

  /** Read bounded raw native balance; wallet-base conversion supplies Rosen wrapped units. */
  getAddressBalance = async (value: string): Promise<bigint> => {
    const balance = await this.config.getAddressBalance(nativeAddress(value));
    if (typeof balance !== 'bigint' || balance < 0n || balance > 2_100_000_000_000_000n)
      throw new Error('Invalid BCH native balance');
    return balance;
  };

  /** Check raw native amount against Rosen-wrapped fees using an explicit current asset mapping. */
  private validateWrappedDeposit = async (
    amount: bigint,
    metadata: BitcoinCashLockMetadata,
  ): Promise<void> => {
    if (typeof amount !== 'bigint' || amount <= 0n || amount > 2_100_000_000_000_000n)
      throw new Error('Invalid BCH native deposit amount');
    for (const fee of [metadata.bridgeFee, metadata.networkFee]) {
      if (typeof fee !== 'bigint' || fee < 0n || fee > 0xffffffffffffffffn)
        throw new Error('Invalid BCH Rosen fee');
    }
    const tokenMap = await this.config.getTokenMap();
    const mapping = tokenMap.getTokenSet('bch');
    const source = mapping?.['bitcoin-cash'];
    if (
      source?.tokenId !== 'bch' ||
      source.type !== 'native' ||
      source.decimals !== 8 ||
      !mapping?.[metadata.toChain]
    )
      throw new Error('Missing BCH bridge asset mapping');
    const wrapped = tokenMap.wrapAmount('bch', amount, this.name).amount;
    if (wrapped <= metadata.bridgeFee + metadata.networkFee)
      throw new Error('BCH wrapped deposit does not cover Rosen fees');
  };

  /** Obtain operator-controlled signing parameters for an explicit native deposit request. */
  generateSigningParameters = async (
    request: BitcoinCashDepositRequest,
  ): Promise<BitcoinCashUnsignedLockRequest> => {
    const original = Object.freeze({
      fromAddress: request.fromAddress,
      amount: request.amount,
      toChain: request.toChain,
      toAddress: request.toAddress,
      bridgeFee: request.bridgeFee,
      networkFee: request.networkFee,
    });
    nativeAddress(original.fromAddress);
    await this.validateWrappedDeposit(original.amount, original);
    const result = await this.config.generateSigningParameters(Object.freeze({ ...original }));
    if (
      result.fromAddress !== original.fromAddress ||
      result.lockAddress !== this.lockAddress ||
      result.amount !== original.amount ||
      result.toChain !== original.toChain ||
      result.toAddress !== original.toAddress ||
      result.bridgeFee !== original.bridgeFee ||
      result.networkFee !== original.networkFee
    )
      throw new Error('BCH server signing parameters changed request');
    return result;
  };

  /** Check signed bytes locally; server submission must independently enforce its own policy. */
  submitTransaction = async (
    signedHex: string,
    intent: BitcoinCashUnsignedLock,
    expectedMetadata: BitcoinCashLockMetadata,
    signal?: AbortSignal,
  ): Promise<string> => {
    if (signal?.aborted) throw new Error('BCH submission cancelled');
    const original = snapshotIntent(intent);
    const metadata = Object.freeze({
      toChain: expectedMetadata.toChain,
      toAddress: expectedMetadata.toAddress,
      bridgeFee: expectedMetadata.bridgeFee,
      networkFee: expectedMetadata.networkFee,
    });
    if (original.lockAddress !== this.lockAddress) throw new Error('BCH signing treasury mismatch');
    const checked = validateBitcoinCashSignedLock(signedHex, original);
    await this.validateWrappedDeposit(original.amount, metadata);
    if (signal?.aborted) throw new Error('BCH submission cancelled');
    const result = signal
      ? await this.config.submitTransaction(
          checked.signedTransactionHex,
          original,
          metadata,
          signal,
        )
      : await this.config.submitTransaction(checked.signedTransactionHex, original, metadata);
    if (result !== checked.txId) throw new Error('BCH server transaction ID mismatch');
    return result;
  };
}
