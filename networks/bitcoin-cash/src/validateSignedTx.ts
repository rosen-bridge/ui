import {
  binToHex,
  cashAddressToLockingBytecode,
  decodeTransactionBCH,
  encodeTransactionBCH,
  generateSigningSerializationBCH,
  hash256,
  hashTransaction,
  hexToBin,
  ripemd160,
  secp256k1,
  sha256,
} from '@bitauth/libauth';

import { decodeAddress } from '@rosen-bridge/address-codec';
import { NETWORKS } from '@rosen-ui/constants';

import {
  type BitcoinCashUnsignedLock,
  generateBitcoinCashLockFee,
  generateBitcoinCashUnsignedLock,
} from './generateUnsignedTx.js';
import { type BitcoinCashLockMetadata, generateBitcoinCashLockMetadata } from './metadata.js';

const MAX_BYTES = 100_000;

/** Validated signed deposit bytes; caller must still authorize and recheck unspent inputs. */
export interface BitcoinCashSignedLock {
  readonly signedTransactionHex: string;
  readonly txId: string;
  readonly fee: bigint;
}

/**
 * Decode bounded canonical native transaction bytes.
 * @param value Untrusted lowercase transaction hex.
 * @returns Decoded transaction with byte-for-byte canonical encoding.
 * @throws For invalid framing, excessive size or noncanonical encoding.
 */
const transaction = (value: unknown) => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_BYTES * 2 ||
    !/^(?:[0-9a-f]{2})+$/.test(value)
  )
    throw new Error('Invalid bounded BCH transaction bytes');
  const result = decodeTransactionBCH(hexToBin(value));
  if (typeof result === 'string' || binToHex(encodeTransactionBCH(result)) !== value)
    throw new Error('Invalid canonical BCH transaction');
  return result;
};

/**
 * Decode a checked metadata fee slice in shared Rosen big-endian order.
 * @param value Eight bytes from the bounded metadata payload.
 * @returns Unsigned Rosen-normalized fee as bigint without number precision loss.
 */
const uint64 = (value: Uint8Array): bigint =>
  value.reduce((total, byte) => total * 256n + BigInt(byte), 0n);

/**
 * Recover metadata through the shared registry and codec, then check canonical bytes.
 * @param script Unsigned transaction metadata locking script.
 * @returns Route and Rosen-normalized fee fields for reconstructing the builder request.
 * @throws For malformed payload, unassigned route or noncanonical script/address.
 */
const metadata = (script: Uint8Array): BitcoinCashLockMetadata => {
  if (script[0] !== 0x6a) throw new Error('Invalid BCH metadata output');
  const offset = script[1] === 0x4c ? 3 : 2;
  const payload = script.slice(offset);
  if (payload.length < 19 || payload.length > 80 || payload[17] !== payload.length - 18)
    throw new Error('Invalid BCH metadata fields');
  const target = Object.values(NETWORKS).find(
    (entry) => entry.index >= 0 && entry.index === payload[0],
  );
  if (!target) throw new Error('Unassigned BCH metadata destination');
  const parsed: BitcoinCashLockMetadata = {
    toChain: target.key,
    toAddress: decodeAddress(target.key, binToHex(payload.slice(18))),
    bridgeFee: uint64(payload.slice(1, 9)),
    networkFee: uint64(payload.slice(9, 17)),
  };
  if (binToHex(generateBitcoinCashLockMetadata(parsed)) !== binToHex(script))
    throw new Error('Noncanonical BCH metadata');
  return parsed;
};

/**
 * Authenticates signed native deposit bytes against an independently reconstructed intent.
 * @param signedHex Canonical signed BCH transaction; wallet input remains untrusted.
 * @param intent Unsigned builder result, including authenticated complete parent transactions.
 * @returns Frozen transaction bytes, exact transaction ID and native satoshi fee.
 * @throws Error For altered body, forged intent/prevouts or invalid Schnorr 0x41 signature.
 * @remarks This proves byte and signature consistency, not operator approval, chain
 * inclusion or current unspent status. Broadcast must enforce configured treasury,
 * route policy and a fresh authenticated provider snapshot independently.
 */
export const validateBitcoinCashSignedLock = (
  signedHex: string,
  intent: BitcoinCashUnsignedLock,
): Readonly<BitcoinCashSignedLock> => {
  const unsigned = transaction(intent.unsignedTransactionHex);
  const signed = transaction(signedHex);
  if (
    !Array.isArray(intent.selectedUtxos) ||
    intent.selectedUtxos.length < 1 ||
    intent.selectedUtxos.length > 100 ||
    unsigned.outputs.length !== 3 ||
    unsigned.outputs[1].valueSatoshis !== 0n ||
    unsigned.outputs.some((output) => output.token !== undefined) ||
    unsigned.inputs.some((input) => input.unlockingBytecode.length !== 0)
  )
    throw new Error('Invalid native BCH signing intent');
  const fields = metadata(unsigned.outputs[1].lockingBytecode);
  const unitFee = generateBitcoinCashLockFee({
    ...fields,
    inputCount: intent.selectedUtxos.length,
    feeRate: 1,
  });
  if (typeof intent.fee !== 'bigint' || intent.fee < unitFee || intent.fee % unitFee !== 0n)
    throw new Error('Invalid BCH intent fee policy');
  const feeRate = Number(intent.fee / unitFee);
  const reconstructed = generateBitcoinCashUnsignedLock({
    ...fields,
    fromAddress: intent.fromAddress,
    lockAddress: intent.lockAddress,
    amount: intent.amount,
    feeRate,
    maxFee: intent.fee,
    utxos: intent.selectedUtxos,
  });
  if (
    reconstructed.unsignedTransactionHex !== intent.unsignedTransactionHex ||
    reconstructed.selectedUtxos.length !== intent.selectedUtxos.length ||
    reconstructed.fee !== intent.fee
  )
    throw new Error('Forged BCH signing intent');
  const emptyUnlocks = {
    ...signed,
    inputs: signed.inputs.map((input) => ({ ...input, unlockingBytecode: new Uint8Array() })),
  };
  if (binToHex(encodeTransactionBCH(emptyUnlocks)) !== intent.unsignedTransactionHex)
    throw new Error('Signed BCH transaction body changed');
  const decodedSource = cashAddressToLockingBytecode(intent.fromAddress);
  if (typeof decodedSource === 'string') throw new Error('Invalid BCH signing source');
  const sourceOutputs = intent.selectedUtxos.map((utxo) => ({
    valueSatoshis: utxo.value,
    lockingBytecode: hexToBin(utxo.scriptPubKey),
  }));
  for (const [inputIndex, input] of signed.inputs.entries()) {
    const unlocking = input.unlockingBytecode;
    if (
      unlocking.length !== 100 ||
      unlocking[0] !== 65 ||
      unlocking[65] !== 0x41 ||
      unlocking[66] !== 33 ||
      ![2, 3].includes(unlocking[67])
    )
      throw new Error('BCH wallet requires minimal Schnorr 0x41 P2PKH pushes');
    const signature = unlocking.slice(1, 65);
    const publicKey = unlocking.slice(67);
    const sourceHash = ripemd160.hash(sha256.hash(publicKey));
    if (binToHex(sourceHash) !== binToHex(decodedSource.bytecode.slice(3, 23)))
      throw new Error('BCH signature key does not match source');
    const preimage = generateSigningSerializationBCH(
      { inputIndex, sourceOutputs, transaction: signed },
      {
        coveredBytecode: sourceOutputs[inputIndex].lockingBytecode,
        signingSerializationType: Uint8Array.of(0x41),
      },
    );
    if (!secp256k1.verifySignatureSchnorr(signature, publicKey, hash256(preimage)))
      throw new Error('Invalid BCH wallet signature');
  }
  const totalInput = intent.selectedUtxos.reduce((total, utxo) => total + utxo.value, 0n);
  const fee =
    totalInput - signed.outputs.reduce((total, output) => total + output.valueSatoshis, 0n);
  if (fee !== intent.fee) throw new Error('BCH signed fee changed');
  return Object.freeze({
    signedTransactionHex: signedHex,
    txId: hashTransaction(hexToBin(signedHex)),
    fee,
  });
};
