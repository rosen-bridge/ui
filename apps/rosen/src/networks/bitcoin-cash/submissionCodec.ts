import type { BitcoinCashLockMetadata, BitcoinCashUnsignedLock } from '@rosen-network/bitcoin-cash';
import type { BitcoinCashSpendableUtxo } from '@rosen-network/bitcoin-cash/server';
import { NETWORKS } from '@rosen-ui/constants';

/** Dedicated HTTP envelope budget; authenticated copied parent context retains its tighter 4M-hex bound. */
export const BITCOIN_CASH_SUBMISSION_BODY_BYTES = 5_000_000;

/** Primitive HTTP submission; Rosen fees are resolved by the server rather than supplied as authority. */
export interface BitcoinCashHttpSubmission {
  signedTransactionHex: string;
  intent: BitcoinCashUnsignedLock;
  destination: Pick<BitcoinCashLockMetadata, 'toChain' | 'toAddress'>;
}

/** Require exactly the known fields before copying untrusted transport objects. */
const object = (value: unknown, fields: readonly string[]): Record<string, unknown> => {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== fields.length ||
    fields.some((field) => !Object.hasOwn(value, field))
  )
    throw new Error('Invalid BCH submission object');
  return value as Record<string, unknown>;
};

/** Accept bounded canonical lower-case hex without whitespace or prefixes. */
const hex = (value: unknown, minimum: number, maximum: number): string => {
  if (
    typeof value !== 'string' ||
    value.length < minimum ||
    value.length > maximum ||
    value.length % 2 !== 0 ||
    !/^[0-9a-f]+$/.test(value)
  )
    throw new Error('Invalid BCH submission hex');
  return value;
};

/** Decode an exact nonnegative decimal string without signs, exponents or precision loss. */
const satoshis = (value: unknown, minimum: bigint): bigint => {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,15})$/.test(value))
    throw new Error('Invalid BCH submission amount');
  const amount = BigInt(value);
  if (amount < minimum || amount > 2_100_000_000_000_000n)
    throw new Error('Invalid BCH submission amount');
  return amount;
};

/** Require exact finite integer height/index assertions; authentication is a later server boundary. */
const integer = (value: unknown, minimum: number, maximum: number): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  )
    throw new Error('Invalid BCH submission integer');
  return value;
};

/** Validate bounded ASCII address/route transport strings without claiming chain authorization. */
const text = (value: unknown, maximum: number): string => {
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > maximum ||
    !/^[\x21-\x7e]+$/.test(value)
  )
    throw new Error('Invalid BCH submission text');
  return value;
};

/** Decode a strict bounded JSON envelope; signature, parent and quote authority remain mandatory downstream. */
export const decodeBitcoinCashSubmission = (body: string): Readonly<BitcoinCashHttpSubmission> => {
  if (
    typeof body !== 'string' ||
    body.length > BITCOIN_CASH_SUBMISSION_BODY_BYTES ||
    !/^[\x20-\x7e\r\n\t]*$/.test(body)
  )
    throw new Error('Invalid BCH submission body');
  const value: unknown = JSON.parse(body);
  const root = object(value, ['signedTransactionHex', 'intent', 'destination']);
  const source = object(root.intent, [
    'unsignedTransactionHex',
    'selectedUtxos',
    'fee',
    'amount',
    'fromAddress',
    'lockAddress',
  ]);
  const destination = object(root.destination, ['toChain', 'toAddress']);
  const toChain = text(destination.toChain, 30);
  if (
    !Object.hasOwn(NETWORKS, toChain) ||
    !Object.values(NETWORKS).some((network) => network.key === toChain)
  )
    throw new Error('Invalid BCH submission route');
  if (
    !Array.isArray(source.selectedUtxos) ||
    source.selectedUtxos.length < 1 ||
    source.selectedUtxos.length > 100
  )
    throw new Error('Invalid BCH submission input count');
  let characters = 0;
  const selectedUtxos: readonly Readonly<BitcoinCashSpendableUtxo>[] = Object.freeze(
    source.selectedUtxos.map((item: unknown) => {
      const utxo = object(item, [
        'txId',
        'index',
        'value',
        'scriptPubKey',
        'parentTransactionHex',
        'height',
        'confirmations',
        'coinbase',
      ]);
      const parentTransactionHex = hex(utxo.parentTransactionHex, 2, 2_000_000);
      characters += parentTransactionHex.length;
      if (characters > 4_000_000) throw new Error('Invalid BCH copied parent budget');
      const scriptPubKey = hex(utxo.scriptPubKey, 50, 50);
      if (!/^76a914[0-9a-f]{40}88ac$/.test(scriptPubKey) || typeof utxo.coinbase !== 'boolean')
        throw new Error('Invalid BCH submission native input');
      return Object.freeze({
        txId: hex(utxo.txId, 64, 64),
        index: integer(utxo.index, 0, 0xffffffff),
        value: satoshis(utxo.value, 1n),
        scriptPubKey,
        parentTransactionHex,
        height: integer(utxo.height, 1, 0x7fffffff),
        confirmations: integer(utxo.confirmations, 1, 0x7fffffff),
        coinbase: utxo.coinbase,
      });
    }),
  );
  return Object.freeze({
    signedTransactionHex: hex(root.signedTransactionHex, 2, 200000),
    intent: Object.freeze({
      unsignedTransactionHex: hex(source.unsignedTransactionHex, 2, 200000),
      selectedUtxos,
      fee: satoshis(source.fee, 0n),
      amount: satoshis(source.amount, 1n),
      fromAddress: text(source.fromAddress, 100),
      lockAddress: text(source.lockAddress, 100),
    }),
    destination: Object.freeze({ toChain, toAddress: text(destination.toAddress, 256) }),
  });
};

/** Encode known primitives only; JSON does not carry BigInts, arbitrary extra fields or client fee authority. */
export const encodeBitcoinCashSubmission = (submission: BitcoinCashHttpSubmission): string => {
  const { intent } = submission;
  const signedTransactionHex = hex(submission.signedTransactionHex, 2, 200000);
  const unsignedTransactionHex = hex(intent.unsignedTransactionHex, 2, 200000);
  const fromAddress = text(intent.fromAddress, 100);
  const lockAddress = text(intent.lockAddress, 100);
  const toChain = text(submission.destination.toChain, 30);
  const toAddress = text(submission.destination.toAddress, 256);
  if (!Array.isArray(intent.selectedUtxos) || intent.selectedUtxos.length > 100)
    throw new Error('Invalid BCH submission input count');
  let characters = 0;
  const selectedUtxos = intent.selectedUtxos.map((utxo) => {
    if (
      typeof utxo.parentTransactionHex !== 'string' ||
      typeof utxo.value !== 'bigint' ||
      typeof utxo.coinbase !== 'boolean' ||
      utxo.value <= 0n ||
      utxo.value > 2_100_000_000_000_000n
    )
      throw new Error('Invalid BCH submission input');
    characters += utxo.parentTransactionHex.length;
    if (characters > 4_000_000) throw new Error('Invalid BCH copied parent budget');
    return {
      txId: hex(utxo.txId, 64, 64),
      index: integer(utxo.index, 0, 0xffffffff),
      value: utxo.value.toString(),
      scriptPubKey: hex(utxo.scriptPubKey, 50, 50),
      parentTransactionHex: hex(utxo.parentTransactionHex, 2, 2_000_000),
      height: integer(utxo.height, 1, 0x7fffffff),
      confirmations: integer(utxo.confirmations, 1, 0x7fffffff),
      coinbase: utxo.coinbase,
    };
  });
  if (
    typeof intent.amount !== 'bigint' ||
    intent.amount <= 0n ||
    intent.amount > 2_100_000_000_000_000n ||
    typeof intent.fee !== 'bigint' ||
    intent.fee < 0n ||
    intent.fee > 2_100_000_000_000_000n
  )
    throw new Error('Invalid BCH submission amount');
  const body = JSON.stringify({
    signedTransactionHex,
    intent: {
      unsignedTransactionHex,
      selectedUtxos,
      fee: intent.fee.toString(),
      amount: intent.amount.toString(),
      fromAddress,
      lockAddress,
    },
    destination: { toChain, toAddress },
  });
  decodeBitcoinCashSubmission(body);
  return body;
};
