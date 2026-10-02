import type { TokenMap } from '@rosen-bridge/tokens';
import type { CalculateFee } from '@rosen-network/base';
import {
  type BitcoinCashLockMetadata,
  type BitcoinCashUnsignedLock,
  generateBitcoinCashLockMetadata,
  generateBitcoinCashUnsignedLock,
  validateBitcoinCashSignedLock,
} from '@rosen-network/bitcoin-cash';
import type { BitcoinCashDepositRequest } from '@rosen-network/bitcoin-cash/client';
import type {
  BitcoinCashSpendableUtxo,
  BitcoinCashSubmissionPolicy,
} from '@rosen-network/bitcoin-cash/server';
import { isNetworkAvailable } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

/** Authenticated server readers; the browser receives no endpoint or arbitrary RPC method. */
export interface BitcoinCashBridgeReader {
  getSpendableUtxos(address: string): Promise<BitcoinCashSpendableUtxo[]>;
  getAddressAssets(address: string): Promise<{ nativeToken: bigint; tokens: readonly unknown[] }>;
}

/** Dedicated submitter rechecks policy, signed bytes and current spend eligibility before broadcast. */
export interface BitcoinCashBridgeSubmitter {
  submit(
    signedHex: string,
    intent: BitcoinCashUnsignedLock,
    expectedMetadata: BitcoinCashLockMetadata,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<string>;
}

/** Check the trusted server clock independently of event-loop timer dispatch. */
const submissionActive = (signal?: AbortSignal, absoluteDeadline?: number) => {
  if (
    absoluteDeadline !== undefined &&
    (!Number.isSafeInteger(absoluteDeadline) ||
      absoluteDeadline <= 0 ||
      Date.now() >= absoluteDeadline)
  )
    throw new Error('BCH submission deadline exceeded');
  if (signal?.aborted) throw new Error('BCH submission cancelled');
};

/** Reject cancellation or expiry before work starts, during an await and before its result is accepted. */
const interruptible = async <T>(
  work: () => Promise<T>,
  signal?: AbortSignal,
  absoluteDeadline?: number,
): Promise<T> => {
  submissionActive(signal, absoluteDeadline);
  if (!signal) {
    const value = await work();
    submissionActive(signal, absoluteDeadline);
    return value;
  }
  let cancelled: (() => void) | undefined;
  const cancellation = new Promise<never>((_resolve, reject) => {
    cancelled = () => reject(new Error('BCH submission cancelled'));
    signal.addEventListener('abort', cancelled, { once: true });
  });
  try {
    const value = await Promise.race([
      Promise.resolve().then(() => {
        submissionActive(signal, absoluteDeadline);
        return work();
      }),
      cancellation,
    ]);
    submissionActive(signal, absoluteDeadline);
    return value;
  } finally {
    if (cancelled) signal.removeEventListener('abort', cancelled);
  }
};

/** Trusted operator policy and real minimum-fee query supplied exclusively on the server. */
export interface BitcoinCashBridgeActionConfig {
  policy: BitcoinCashSubmissionPolicy;
  minimumFeeNFT: string;
  nextHeightInterval: number;
  getTokenMap(): Promise<TokenMap>;
  calculateFee: CalculateFee;
  reader: BitcoinCashBridgeReader;
  submitter: BitcoinCashBridgeSubmitter;
}

/** Snapshot bounded raw-parent intent before crossing asynchronous quote or submission boundaries. */
const snapshotIntent = (intent: BitcoinCashUnsignedLock): BitcoinCashUnsignedLock => {
  if (
    !Array.isArray(intent.selectedUtxos) ||
    intent.selectedUtxos.length < 1 ||
    intent.selectedUtxos.length > 100
  )
    throw new Error('Invalid BCH signing context');
  let characters = 0;
  for (const utxo of intent.selectedUtxos) {
    if (typeof utxo.parentTransactionHex !== 'string')
      throw new Error('Invalid BCH signing context');
    characters += utxo.parentTransactionHex.length;
    if (characters > 4_000_000) throw new Error('Invalid BCH signing context');
  }
  return Object.freeze({
    ...intent,
    selectedUtxos: Object.freeze(intent.selectedUtxos.map((utxo) => Object.freeze({ ...utxo }))),
  });
};

/** Create trusted quote, preparation and submission joins without initializing a provider connection. */
export const createBitcoinCashBridgeActions = (configuration: BitcoinCashBridgeActionConfig) => {
  if (!isNetworkAvailable('bitcoin-cash')) throw new Error('BCH chain index is unassigned');
  if (
    !/^[0-9a-f]{64}$/.test(configuration.minimumFeeNFT) ||
    !Number.isSafeInteger(configuration.nextHeightInterval) ||
    configuration.nextHeightInterval < 1 ||
    !Number.isSafeInteger(configuration.policy.feeRate) ||
    configuration.policy.feeRate < 1 ||
    typeof configuration.policy.maxFee !== 'bigint' ||
    configuration.policy.maxFee < 1n ||
    configuration.policy.maxFee > 2_100_000_000_000_000n ||
    !Array.isArray(configuration.policy.allowedDestinationChains) ||
    configuration.policy.allowedDestinationChains.length < 1 ||
    new Set(configuration.policy.allowedDestinationChains).size !==
      configuration.policy.allowedDestinationChains.length ||
    configuration.policy.allowedDestinationChains.some((chain) => !isNetworkAvailable(chain))
  )
    throw new Error('Invalid BCH trusted bridge policy');
  const policy = Object.freeze({
    ...configuration.policy,
    allowedDestinationChains: Object.freeze([...configuration.policy.allowedDestinationChains]),
  });
  const minimumFeeNFT = configuration.minimumFeeNFT;
  const interval = configuration.nextHeightInterval;

  /** Resolve server-owned token identifiers and current quoted fees in Rosen wrapped units. */
  const quote = async (
    amount: bigint,
    destination: Pick<BitcoinCashLockMetadata, 'toChain' | 'toAddress'>,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<BitcoinCashLockMetadata> => {
    submissionActive(signal, absoluteDeadline);
    if (
      typeof amount !== 'bigint' ||
      amount <= 0n ||
      amount > 2_100_000_000_000_000n ||
      !policy.allowedDestinationChains.includes(destination.toChain)
    )
      throw new Error('Invalid BCH deposit route or amount');
    // Shared codec validates destination and assigned route before any remote quote.
    generateBitcoinCashLockMetadata({ ...destination, bridgeFee: 0n, networkFee: 0n });
    const map = await interruptible(() => configuration.getTokenMap(), signal, absoluteDeadline);
    const mapping = map.getTokenSet('bch');
    const native = mapping?.['bitcoin-cash'];
    const ergoTokenId = mapping?.ergo?.tokenId;
    if (
      native?.tokenId !== 'bch' ||
      native.type !== 'native' ||
      native.decimals !== 8 ||
      !mapping?.[destination.toChain] ||
      typeof ergoTokenId !== 'string' ||
      !/^[0-9a-f]{64}$/.test(ergoTokenId)
    )
      throw new Error('Missing BCH server bridge asset mapping');
    const wrapped = map.wrapAmount('bch', amount, 'bitcoin-cash').amount;
    const { fees } = await interruptible(
      () =>
        configuration.calculateFee(
          destination.toChain as Network,
          ergoTokenId,
          interval,
          minimumFeeNFT,
        ),
      signal,
      absoluteDeadline,
    );
    for (const value of [fees.bridgeFee, fees.networkFee, fees.feeRatio, fees.feeRatioDivisor]) {
      if (typeof value !== 'bigint' || value < 0n || value > 0xffffffffffffffffn)
        throw new Error('Invalid BCH trusted Rosen quote');
    }
    if (fees.feeRatioDivisor === 0n) throw new Error('Invalid BCH trusted Rosen quote');
    const variable = (wrapped * fees.feeRatio) / fees.feeRatioDivisor;
    const bridgeFee = variable > fees.bridgeFee ? variable : fees.bridgeFee;
    if (bridgeFee > 0xffffffffffffffffn || wrapped <= bridgeFee + fees.networkFee)
      throw new Error('BCH wrapped deposit does not cover trusted Rosen fees');
    return Object.freeze({ ...destination, bridgeFee, networkFee: fees.networkFee });
  };

  /** Prepare authenticated native parents only after an exact server quote matches the requested metadata. */
  const generateSigningParameters = async (request: BitcoinCashDepositRequest) => {
    const frozen = Object.freeze({
      fromAddress: request.fromAddress,
      amount: request.amount,
      toChain: request.toChain,
      toAddress: request.toAddress,
      bridgeFee: request.bridgeFee,
      networkFee: request.networkFee,
    });
    const metadata = await quote(frozen.amount, frozen);
    if (frozen.bridgeFee !== metadata.bridgeFee || frozen.networkFee !== metadata.networkFee)
      throw new Error('BCH Rosen fee quote changed');
    const utxos = await configuration.reader.getSpendableUtxos(frozen.fromAddress);
    const parameters = Object.freeze({
      ...frozen,
      lockAddress: policy.lockAddress,
      feeRate: policy.feeRate,
      maxFee: policy.maxFee,
      utxos: Object.freeze(utxos.map((utxo) => Object.freeze({ ...utxo }))),
    });
    generateBitcoinCashUnsignedLock(parameters);
    return parameters;
  };

  /** Recalculate fees from trusted mapping and quote; client fee fields never authorize submission. */
  const submitTransaction = async (
    signedHex: string,
    intent: BitcoinCashUnsignedLock,
    destination: Pick<BitcoinCashLockMetadata, 'toChain' | 'toAddress'>,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<string> => {
    submissionActive(signal, absoluteDeadline);
    const frozen = snapshotIntent(intent);
    const route = Object.freeze({ toChain: destination.toChain, toAddress: destination.toAddress });
    const checked = validateBitcoinCashSignedLock(signedHex, frozen);
    const metadata = await quote(frozen.amount, route, signal, absoluteDeadline);
    const expected = generateBitcoinCashUnsignedLock({
      fromAddress: frozen.fromAddress,
      lockAddress: policy.lockAddress,
      amount: frozen.amount,
      feeRate: policy.feeRate,
      maxFee: policy.maxFee,
      utxos: frozen.selectedUtxos,
      ...metadata,
    });
    if (
      expected.unsignedTransactionHex !== frozen.unsignedTransactionHex ||
      expected.fee !== frozen.fee
    )
      throw new Error('BCH signed deposit differs from trusted quote or policy');
    submissionActive(signal, absoluteDeadline);
    if (absoluteDeadline !== undefined)
      return configuration.submitter.submit(
        checked.signedTransactionHex,
        frozen,
        metadata,
        signal,
        absoluteDeadline,
      );
    return signal
      ? configuration.submitter.submit(checked.signedTransactionHex, frozen, metadata, signal)
      : configuration.submitter.submit(checked.signedTransactionHex, frozen, metadata);
  };

  return Object.freeze({ generateSigningParameters, submitTransaction });
};
