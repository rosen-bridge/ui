import {
  binToHex,
  cashAddressToLockingBytecode,
  decodeTransactionBCH,
  encodeTransactionBCH,
  hashTransaction,
  hexToBin,
  lockingBytecodeToCashAddress,
} from '@bitauth/libauth';

import { type BitcoinCashLockMetadata, generateBitcoinCashLockMetadata } from './metadata.js';
import type { BitcoinCashSpendableUtxo } from './server/bitcoinCashElectrumProvider.js';

const MAX_MONEY = 2_100_000_000_000_000n;
const MAX_INPUTS = 100;
const MAX_SNAPSHOT_OUTPUTS = 1000;
const MAX_PARENT_BYTES = 1_000_000;
const MAX_PARENT_HEX = 4_000_000;
const MIN_CHANGE = 546n;
// Two pushes, compressed key and low-S DER signature with the 0x41 sighash byte.
const MAX_P2PKH_UNLOCKING_BYTES = 107;

/** Native BCH amounts use satoshis; inherited metadata fees use Rosen-normalized units. */
export interface BitcoinCashUnsignedLockRequest extends BitcoinCashLockMetadata {
  fromAddress: string;
  lockAddress: string;
  amount: bigint;
  feeRate: number;
  maxFee: bigint;
  utxos: readonly BitcoinCashSpendableUtxo[];
}

/** Frozen signing intent; amount and miner fee are raw satoshis. */
export interface BitcoinCashUnsignedLock {
  unsignedTransactionHex: string;
  selectedUtxos: readonly Readonly<BitcoinCashSpendableUtxo>[];
  fee: bigint;
  amount: bigint;
  fromAddress: string;
  lockAddress: string;
}

/** Size-estimation inputs for the native P2PKH deposit format. */
export interface BitcoinCashLockFeeRequest extends BitcoinCashLockMetadata {
  inputCount: number;
  feeRate: number;
}

/**
 * Estimate a conservative signed deposit fee using the exact metadata encoding.
 * @param request Input count, integer satoshis per byte and Rosen destination.
 * @returns Raw satoshis covering low-S ECDSA or shorter Schnorr P2PKH signatures.
 * @throws For invalid input counts, fee rates, routes or native fee bounds.
 * @remarks The estimate assumes treasury, metadata and nondust P2PKH change.
 * It does not authenticate a balance, select inputs or authorize a transaction.
 */
export const generateBitcoinCashLockFee = (request: BitcoinCashLockFeeRequest): bigint => {
  if (
    !Number.isSafeInteger(request.inputCount) ||
    request.inputCount < 1 ||
    request.inputCount > MAX_INPUTS ||
    !Number.isSafeInteger(request.feeRate) ||
    request.feeRate < 1
  ) {
    throw new Error('Invalid BCH deposit fee estimate');
  }
  const metadata = generateBitcoinCashLockMetadata(request);
  // With at most 100 inputs, both vector counts are single-byte CompactSize.
  // Header/counts: 10; empty input: 41; P2PKH output: 34; metadata: 9 + script.
  const bytes =
    10 + (41 + MAX_P2PKH_UNLOCKING_BYTES) * request.inputCount + 68 + 9 + metadata.length;
  const fee = BigInt(bytes) * BigInt(request.feeRate);
  if (fee > MAX_MONEY) throw new Error('BCH deposit fee exceeds native supply');
  return fee;
};

/**
 * Resolve an ordinary canonical mainnet P2PKH address to locking bytes.
 * @param address Source or treasury CashAddr.
 * @returns Exact P2PKH locking bytecode.
 * @throws For another network, token-aware address, script form or spelling.
 */
const p2pkhScript = (address: string): Uint8Array => {
  if (typeof address !== 'string' || address.length > 128) {
    throw new Error('Invalid BCH deposit address');
  }
  const decoded = cashAddressToLockingBytecode(address);
  if (
    typeof decoded === 'string' ||
    decoded.prefix !== 'bitcoincash' ||
    decoded.tokenSupport ||
    !/^76a914[0-9a-f]{40}88ac$/.test(binToHex(decoded.bytecode))
  ) {
    throw new Error('BCH deposits require ordinary mainnet P2PKH addresses');
  }
  const canonical = lockingBytecodeToCashAddress({
    bytecode: decoded.bytecode,
    prefix: 'bitcoincash',
    tokenSupport: false,
  });
  if (typeof canonical === 'string' || canonical.address !== address) {
    throw new Error('BCH deposits require canonical prefixed lowercase CashAddr');
  }
  return decoded.bytecode;
};

/**
 * Authenticate a bounded snapshot's raw prevouts before selecting any inputs.
 * @param supplied Provider outputs at one stable reported tip.
 * @param sourceScript Expected source locking bytecode in hexadecimal.
 * @returns Frozen native outputs with exact parent identity and maturity.
 * @throws For inconsistent, duplicate, immature, token-bearing or altered inputs.
 * @remarks Parent hashes authenticate bytes; chain inclusion and unspent state
 * remain provider assertions and must be rechecked immediately before broadcast.
 */
const authenticateSnapshot = (
  supplied: readonly BitcoinCashSpendableUtxo[],
  sourceScript: string,
): readonly Readonly<BitcoinCashSpendableUtxo>[] => {
  if (!Array.isArray(supplied) || supplied.length < 1 || supplied.length > MAX_SNAPSHOT_OUTPUTS) {
    throw new Error('Invalid bounded BCH output snapshot');
  }
  const outpoints = new Set<string>();
  type Parent = Exclude<ReturnType<typeof decodeTransactionBCH>, string>;
  const parents = new Map<string, { hex: string; transaction: Parent }>();
  let parentHexLength = 0;
  let snapshotTip: number | undefined;
  let total = 0n;
  return Object.freeze(
    supplied.map((utxo) => {
      if (
        !utxo ||
        !/^[0-9a-f]{64}$/.test(utxo.txId) ||
        !Number.isSafeInteger(utxo.index) ||
        utxo.index < 0 ||
        utxo.index > 0xffffffff ||
        typeof utxo.value !== 'bigint' ||
        utxo.value <= 0n ||
        utxo.value > MAX_MONEY ||
        utxo.scriptPubKey !== sourceScript ||
        typeof utxo.parentTransactionHex !== 'string' ||
        utxo.parentTransactionHex.length === 0 ||
        utxo.parentTransactionHex.length > MAX_PARENT_BYTES * 2 ||
        !/^(?:[0-9a-f]{2})+$/.test(utxo.parentTransactionHex) ||
        !Number.isSafeInteger(utxo.height) ||
        utxo.height < 1 ||
        !Number.isSafeInteger(utxo.confirmations) ||
        utxo.confirmations < 1 ||
        typeof utxo.coinbase !== 'boolean'
      ) {
        throw new Error('Invalid authenticated BCH source output');
      }
      const tip = utxo.height + utxo.confirmations - 1;
      if (!Number.isSafeInteger(tip) || (snapshotTip !== undefined && snapshotTip !== tip)) {
        throw new Error('Inconsistent BCH output snapshot tip');
      }
      snapshotTip = tip;
      const outpoint = `${utxo.txId}:${utxo.index}`;
      if (outpoints.has(outpoint)) throw new Error('Duplicate BCH source outpoint');
      outpoints.add(outpoint);
      let cached = parents.get(utxo.txId);
      if (!cached) {
        parentHexLength += utxo.parentTransactionHex.length;
        if (parentHexLength > MAX_PARENT_HEX) throw new Error('BCH parent snapshot exceeds bound');
        const bytes = hexToBin(utxo.parentTransactionHex);
        if (hashTransaction(bytes) !== utxo.txId) throw new Error('BCH parent identity mismatch');
        const transaction = decodeTransactionBCH(bytes);
        if (
          typeof transaction === 'string' ||
          transaction.inputs.length < 1 ||
          transaction.outputs.length < 1 ||
          binToHex(encodeTransactionBCH(transaction)) !== utxo.parentTransactionHex
        ) {
          throw new Error('Invalid canonical BCH parent transaction');
        }
        cached = { hex: utxo.parentTransactionHex, transaction };
        parents.set(utxo.txId, cached);
      } else if (cached.hex !== utxo.parentTransactionHex) {
        throw new Error('Conflicting BCH parent bytes');
      }
      const parent = cached.transaction;
      const output = parent.outputs[utxo.index];
      if (
        !output ||
        output.token !== undefined ||
        output.valueSatoshis !== utxo.value ||
        binToHex(output.lockingBytecode) !== sourceScript
      ) {
        throw new Error('BCH source output differs from authenticated parent');
      }
      const coinbase =
        parent.inputs.length === 1 &&
        parent.inputs[0].outpointIndex === 0xffffffff &&
        binToHex(parent.inputs[0].outpointTransactionHash) === '00'.repeat(32);
      if (coinbase !== utxo.coinbase || (coinbase && utxo.confirmations < 100)) {
        throw new Error('Invalid BCH source coinbase maturity');
      }
      total += utxo.value;
      if (total > MAX_MONEY) throw new Error('BCH source balance exceeds native supply');
      return Object.freeze({ ...utxo });
    }),
  );
};

/**
 * Build a native BCH deposit with authenticated inputs and exact Rosen metadata.
 * @param request Source, treasury, raw native amount/miner fee policy, normalized metadata fees and snapshot.
 * @returns Frozen unsigned signing intent with treasury, metadata and change outputs.
 * @throws For invalid inputs, insufficient confirmed balance or exceeded fee limits.
 * @remarks Selection is deterministic, requires nondust change and reserves a
 * conservative low-S ECDSA P2PKH size. Signing must validate the returned body,
 * signatures and exact prevouts; this function neither signs nor broadcasts.
 * The raw amount versus metadata fee check is only a necessary coarse bound:
 * Rosen normalization includes the source decimals and cannot expand the amount.
 * Consumers must also enforce the normalized amount against trusted quoted fees
 * using their authoritative TokenMap before signing and again before submission.
 */
export const generateBitcoinCashUnsignedLock = (
  request: BitcoinCashUnsignedLockRequest,
): BitcoinCashUnsignedLock => {
  const source = p2pkhScript(request.fromAddress);
  const treasury = p2pkhScript(request.lockAddress);
  if (binToHex(source) === binToHex(treasury)) throw new Error('BCH source equals treasury');
  const metadata = generateBitcoinCashLockMetadata(request);
  if (
    typeof request.amount !== 'bigint' ||
    request.amount < MIN_CHANGE ||
    request.amount > MAX_MONEY ||
    request.amount <= request.bridgeFee + request.networkFee ||
    !Number.isSafeInteger(request.feeRate) ||
    request.feeRate < 1 ||
    typeof request.maxFee !== 'bigint' ||
    request.maxFee < 1n ||
    request.maxFee > MAX_MONEY
  ) {
    throw new Error('Invalid bounded BCH deposit amount or fee');
  }
  const outputs = authenticateSnapshot(request.utxos, binToHex(source));
  const selected: Readonly<BitcoinCashSpendableUtxo>[] = [];
  let selectedParentHexLength = 0;
  let total = 0n;
  for (const utxo of outputs) {
    if (selected.length === MAX_INPUTS) throw new Error('BCH deposit exceeds input limit');
    // JSON repeats a shared parent's bytes for every selected output.
    selectedParentHexLength += utxo.parentTransactionHex.length;
    if (selectedParentHexLength > MAX_PARENT_HEX) {
      throw new Error('BCH signing context exceeds returned byte bound');
    }
    selected.push(utxo);
    total += utxo.value;
    const transaction = {
      version: 2,
      locktime: 0,
      inputs: selected.map((input) => ({
        outpointTransactionHash: hexToBin(input.txId),
        outpointIndex: input.index,
        sequenceNumber: 0xffffffff,
        unlockingBytecode: new Uint8Array(),
      })),
      outputs: [
        { valueSatoshis: request.amount, lockingBytecode: treasury },
        { valueSatoshis: 0n, lockingBytecode: metadata },
        { valueSatoshis: MIN_CHANGE, lockingBytecode: source },
      ],
    };
    const signedSize =
      encodeTransactionBCH(transaction).length + selected.length * MAX_P2PKH_UNLOCKING_BYTES;
    if (signedSize > 100_000) throw new Error('BCH deposit exceeds transaction size limit');
    const fee = generateBitcoinCashLockFee({ ...request, inputCount: selected.length });
    if (fee > request.maxFee) throw new Error('BCH deposit exceeds configured fee limit');
    const change = total - request.amount - fee;
    if (change < MIN_CHANGE) continue;
    transaction.outputs[2].valueSatoshis = change;
    return Object.freeze({
      unsignedTransactionHex: binToHex(encodeTransactionBCH(transaction)),
      selectedUtxos: Object.freeze(selected),
      fee,
      amount: request.amount,
      fromAddress: request.fromAddress,
      lockAddress: request.lockAddress,
    });
  }
  throw new Error('Insufficient confirmed BCH balance including fee and change');
};
