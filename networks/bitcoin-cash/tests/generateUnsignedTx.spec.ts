import {
  binToHex,
  decodeTransactionBCH,
  encodeTransactionBCH,
  hashTransaction,
  hexToBin,
  lockingBytecodeToCashAddress,
} from '@bitauth/libauth';
import { describe, expect, it } from 'vitest';

import {
  type BitcoinCashUnsignedLockRequest,
  generateBitcoinCashLockFee,
  generateBitcoinCashLockMetadata,
  generateBitcoinCashUnsignedLock,
} from '../src';
import type { BitcoinCashSpendableUtxo } from '../src/server/bitcoinCashElectrumProvider';

/** Distinct P2PKH source script used by authenticated native parent fixtures. */
const sourceScript = `76a914${'11'.repeat(20)}88ac`;
/** Distinct P2PKH treasury script used to verify exact deposit destination. */
const treasuryScript = `76a914${'22'.repeat(20)}88ac`;

/** Convert a fixture locking script into an ordinary mainnet address. */
const addressFor = (script: string): string => {
  const decoded = lockingBytecodeToCashAddress({
    bytecode: hexToBin(script),
    prefix: 'bitcoincash',
  });
  if (typeof decoded === 'string') throw new Error(decoded);
  return decoded.address;
};

/** Produce canonical parent bytes and the exact source output they commit to. */
const output = (
  value = 100_000n,
  nonce = 1,
  coinbase = false,
  token = false,
): BitcoinCashSpendableUtxo => {
  const parent = encodeTransactionBCH({
    version: 2,
    locktime: nonce,
    inputs: [
      {
        outpointTransactionHash: hexToBin((coinbase ? '00' : '33').repeat(32)),
        outpointIndex: coinbase ? 0xffffffff : 0,
        sequenceNumber: 0xffffffff,
        unlockingBytecode: coinbase ? Uint8Array.of(1, 1) : new Uint8Array(),
      },
    ],
    outputs: [
      {
        valueSatoshis: value,
        lockingBytecode: hexToBin(sourceScript),
        ...(token ? { token: { category: hexToBin('44'.repeat(32)), amount: 1n } } : {}),
      },
    ],
  });
  return {
    txId: hashTransaction(parent),
    index: 0,
    value,
    scriptPubKey: sourceScript,
    parentTransactionHex: binToHex(parent),
    height: 700_000,
    confirmations: coinbase ? 100 : 1,
    coinbase,
  };
};

/** Fresh defaults use real byte codecs and one confirmed noncoinbase output. */
const request = (
  overrides: Partial<BitcoinCashUnsignedLockRequest> = {},
): BitcoinCashUnsignedLockRequest => ({
  fromAddress: addressFor(sourceScript),
  lockAddress: addressFor(treasuryScript),
  toChain: 'ethereum',
  toAddress: `0x${'12'.repeat(20)}`,
  bridgeFee: 100n,
  networkFee: 100n,
  amount: 50_000n,
  feeRate: 2,
  maxFee: 100_000n,
  utxos: [output()],
  ...overrides,
});

describe('generateBitcoinCashUnsignedLock', () => {
  /**
   * @target generateBitcoinCashUnsignedLock authenticates prevouts and preserves the exact deposit intent
   * @dependencies Real libauth, shared registry/address codec; no mocks.
   * @scenario Spend one authenticated native parent at two satoshis per byte.
   * @expected Exact outputs, conservative signed fee and frozen signing intent.
   */
  it('authenticates prevouts and preserves the exact deposit intent', () => {
    const input = request();
    const result = generateBitcoinCashUnsignedLock(input);
    const decoded = decodeTransactionBCH(hexToBin(result.unsignedTransactionHex));
    if (typeof decoded === 'string') throw new Error(decoded);
    expect(decoded.version).toEqual(2);
    expect(decoded.locktime).toEqual(0);
    expect(decoded.inputs).toEqual([
      {
        outpointTransactionHash: hexToBin(input.utxos[0].txId),
        outpointIndex: 0,
        sequenceNumber: 0xffffffff,
        unlockingBytecode: new Uint8Array(),
      },
    ]);
    expect(decoded.outputs).toEqual([
      { valueSatoshis: input.amount, lockingBytecode: hexToBin(treasuryScript) },
      { valueSatoshis: 0n, lockingBytecode: generateBitcoinCashLockMetadata(input) },
      {
        valueSatoshis: 100_000n - input.amount - result.fee,
        lockingBytecode: hexToBin(sourceScript),
      },
    ]);
    expect(result.fee).toEqual(BigInt(result.unsignedTransactionHex.length / 2 + 107) * 2n);
    expect(result.fee).toEqual(generateBitcoinCashLockFee({ ...input, inputCount: 1 }));
    expect(result.selectedUtxos).toEqual(input.utxos);
    expect(Object.isFrozen(result)).toEqual(true);
    expect(Object.isFrozen(result.selectedUtxos)).toEqual(true);
    expect(Object.isFrozen(result.selectedUtxos[0])).toEqual(true);
    input.utxos[0].value = 1n;
    expect(result.selectedUtxos[0].value).toEqual(100_000n);
  });

  /**
   * @target generateBitcoinCashUnsignedLock selects multiple independently authenticated parents
   * @dependencies Real parent serialization; no mocks.
   * @scenario The first output cannot cover the deposit, fee and nondust change.
   * @expected Two inputs in supplied order and a fee covering both unlock scripts.
   */
  it('selects multiple independently authenticated parents', () => {
    const input = request({ amount: 7000n, utxos: [output(5000n, 1), output(5000n, 2)] });
    const result = generateBitcoinCashUnsignedLock(input);
    expect(result.selectedUtxos.map((utxo) => utxo.txId)).toEqual(
      input.utxos.map((utxo) => utxo.txId),
    );
    expect(result.fee).toEqual(BigInt(result.unsignedTransactionHex.length / 2 + 214) * 2n);
  });

  /**
   * @target generateBitcoinCashUnsignedLock rejects a changed prevout claim %#
   * @dependencies One canonical parent; no mocks.
   * @scenario Alter exactly one claimed output field.
   * @expected Rejection before an unsigned signing intent is returned.
   */
  it.each([
    { txId: '55'.repeat(32) },
    { txId: 'bad' },
    { index: 1 },
    { index: -1 },
    { index: 0x100000000 },
    { value: 99_999n },
    { value: 0n },
    { value: 2_100_000_000_000_001n },
    { scriptPubKey: treasuryScript },
    { parentTransactionHex: '00' },
    { parentTransactionHex: '' },
    { height: 0 },
    { confirmations: 0 },
    { confirmations: Number.MAX_SAFE_INTEGER },
    { coinbase: true },
  ])('rejects a changed prevout claim %#', (change) => {
    expect(() =>
      generateBitcoinCashUnsignedLock(request({ utxos: [{ ...output(), ...change }] })),
    ).toThrow();
  });

  /**
   * @target generateBitcoinCashUnsignedLock rejects tokens on the selected source output
   * @dependencies Canonical libauth CashToken parent bytes; no mocks.
   * @scenario The target output includes fungible token data.
   * @expected Rejection even though source script and satoshis match.
   */
  it('rejects tokens on the selected source output', () => {
    expect(() =>
      generateBitcoinCashUnsignedLock(request({ utxos: [output(100_000n, 1, false, true)] })),
    ).toThrow();
  });

  /**
   * @target generateBitcoinCashUnsignedLock enforces coinbase maturity from the authenticated parent
   * @dependencies Canonical coinbase fixture; no mocks.
   * @scenario Use the same raw parent at 99 and 100 confirmations.
   * @expected The immature output fails and the mature output succeeds.
   */
  it('enforces coinbase maturity from the authenticated parent', () => {
    const utxo = output(100_000n, 1, true);
    expect(() =>
      generateBitcoinCashUnsignedLock(request({ utxos: [{ ...utxo, confirmations: 99 }] })),
    ).toThrow();
    expect(
      generateBitcoinCashUnsignedLock(request({ utxos: [utxo] })).selectedUtxos[0].coinbase,
    ).toEqual(true);
  });

  /**
   * @target generateBitcoinCashUnsignedLock rejects duplicate and inconsistent snapshots
   * @dependencies Two independent parent fixtures; no mocks.
   * @scenario Duplicate one output, then separately alter only the second height.
   * @expected Both inconsistent snapshots fail before selection.
   */
  it('rejects duplicate and inconsistent snapshots', () => {
    const first = output();
    expect(() => generateBitcoinCashUnsignedLock(request({ utxos: [first, first] }))).toThrow(
      'Duplicate',
    );
    expect(() =>
      generateBitcoinCashUnsignedLock(
        request({ utxos: [first, { ...output(100_000n, 2), height: 700_001 }] }),
      ),
    ).toThrow('snapshot tip');
  });

  /**
   * @target generateBitcoinCashUnsignedLock rejects an invalid deposit intent %#
   * @dependencies Valid native parent and shared metadata codec; no mocks.
   * @scenario Alter one amount, fee-rate, fee-cap or route parameter.
   * @expected Every invalid request fails without producing signing bytes.
   */
  it.each([
    { amount: 545n },
    { amount: 2_100_000_000_000_001n },
    { amount: 50_000n, bridgeFee: 50_000n },
    { feeRate: 0 },
    { feeRate: 1.5 },
    { maxFee: 0n },
    { maxFee: 1n },
    { toChain: 'bitcoin-cash' },
    { toAddress: '0x12' },
    { fromAddress: addressFor(sourceScript).toUpperCase() },
    { lockAddress: addressFor(sourceScript) },
    { lockAddress: addressFor(`a914${'22'.repeat(20)}87`) },
  ])('rejects an invalid deposit intent %#', (change) => {
    expect(() => generateBitcoinCashUnsignedLock(request(change))).toThrow();
  });

  /**
   * @target generateBitcoinCashUnsignedLock refuses insufficient funds for fee and nondust change
   * @dependencies Valid raw parent; no mocks.
   * @scenario Attempt to deposit the entire source balance.
   * @expected Insufficient-balance error instead of fee or change mutation.
   */
  it('refuses insufficient funds for fee and nondust change', () => {
    expect(() => generateBitcoinCashUnsignedLock(request({ amount: 100_000n }))).toThrow(
      'Insufficient',
    );
  });

  /**
   * @target generateBitcoinCashUnsignedLock bounds snapshot and selected input counts
   * @dependencies Real small parents with distinct transaction identities.
   * @scenario Supply 1001 rows, then 101 insufficient inputs in a bounded snapshot.
   * @expected Snapshot and input-limit failures remain distinct.
   */
  it('bounds snapshot and selected input counts', () => {
    expect(() =>
      generateBitcoinCashUnsignedLock(request({ utxos: Array(1001).fill(output()) })),
    ).toThrow('snapshot');
    const utxos = Array.from({ length: 101 }, (_, index) => output(1000n, index + 1));
    expect(() => generateBitcoinCashUnsignedLock(request({ amount: 100_000n, utxos }))).toThrow(
      'input limit',
    );
  });

  /**
   * @target generateBitcoinCashUnsignedLock bounds parent bytes and requires canonical transaction encoding
   * @dependencies Real transaction hash and decoder; no mocks.
   * @scenario Exceed the raw-byte cap, then append a byte and recompute its hash.
   * @expected Both failures occur before a parent can authorize a deposit.
   */
  it('bounds parent bytes and requires canonical transaction encoding', () => {
    const utxo = output();
    expect(() =>
      generateBitcoinCashUnsignedLock(
        request({ utxos: [{ ...utxo, parentTransactionHex: '00'.repeat(1_000_001) }] }),
      ),
    ).toThrow();
    const parentTransactionHex = `${utxo.parentTransactionHex}00`;
    expect(() =>
      generateBitcoinCashUnsignedLock(
        request({
          utxos: [
            {
              ...utxo,
              parentTransactionHex,
              txId: hashTransaction(hexToBin(parentTransactionHex)),
            },
          ],
        }),
      ),
    ).toThrow('canonical');
  });

  /**
   * @target generateBitcoinCashUnsignedLock bounds repeated raw parent context in the returned signing intent
   * @dependencies One canonical large parent with three small native targets.
   * @scenario Input selection needs all targets sharing the same bounded parent.
   * @expected Rejection of aggregate copied context without allocating huge JSON.
   */
  it('bounds repeated raw parent context in the returned signing intent', () => {
    const native = output(1000n);
    const parent = decodeTransactionBCH(hexToBin(native.parentTransactionHex));
    if (typeof parent === 'string') throw new Error(parent);
    parent.outputs.push(
      ...Array.from({ length: 26_999 }, (_, index) => ({
        valueSatoshis: index < 2 ? 1000n : 1n,
        lockingBytecode: hexToBin(sourceScript),
      })),
    );
    const bytes = encodeTransactionBCH(parent);
    const first = {
      ...native,
      txId: hashTransaction(bytes),
      parentTransactionHex: binToHex(bytes),
    };
    const utxos = [first, { ...first, index: 1 }, { ...first, index: 2 }];
    expect(() =>
      generateBitcoinCashUnsignedLock(request({ amount: 1500n, feeRate: 1, utxos })),
    ).toThrow('returned byte bound');
  });
  /**
   * @target generateBitcoinCashUnsignedLock rejects an aggregate balance above native supply
   * @dependencies Two individually valid canonical parents; no mocks.
   * @scenario Their distinct native outputs sum beyond the maximum BCH supply.
   * @expected Aggregate-balance rejection before input selection.
   */
  it('rejects an aggregate balance above native supply', () => {
    expect(() =>
      generateBitcoinCashUnsignedLock(
        request({
          utxos: [output(1_200_000_000_000_000n, 1), output(1_200_000_000_000_000n, 2)],
        }),
      ),
    ).toThrow('balance exceeds native supply');
  });

  /**
   * @target generateBitcoinCashUnsignedLock rejects excessive aggregate unique parent bytes
   * @dependencies Canonical synthetic parents with many small outputs; no mocks.
   * @scenario Three individually bounded parents exceed the aggregate hex cap.
   * @expected Aggregate-parent rejection instead of authorizing a signing intent.
   */
  it('rejects excessive aggregate unique parent bytes', () => {
    const utxos = [1, 2, 3].map((nonce) => {
      const utxo = output(100_000n, nonce);
      const parent = decodeTransactionBCH(hexToBin(utxo.parentTransactionHex));
      if (typeof parent === 'string') throw new Error(parent);
      parent.outputs.push(
        ...Array.from({ length: 26_999 }, () => ({
          valueSatoshis: 1n,
          lockingBytecode: hexToBin(sourceScript),
        })),
      );
      const bytes = encodeTransactionBCH(parent);
      expect(bytes.length < 1_000_000).toEqual(true);
      return { ...utxo, txId: hashTransaction(bytes), parentTransactionHex: binToHex(bytes) };
    });
    expect(() => generateBitcoinCashUnsignedLock(request({ utxos }))).toThrow(
      'parent snapshot exceeds bound',
    );
  });

  /**
   * @target generateBitcoinCashUnsignedLock accepts multiple native outputs sharing a parent with a token sibling
   * @dependencies Canonical parent with two native outputs and one token sibling.
   * @scenario Both native outputs are required to cover the deposit.
   * @expected Both native targets selected, with the unrelated token output untouched.
   */
  it('accepts multiple native outputs sharing a parent with a token sibling', () => {
    const native = output();
    const parent = decodeTransactionBCH(hexToBin(native.parentTransactionHex));
    if (typeof parent === 'string') throw new Error(parent);
    parent.outputs.push(
      {
        valueSatoshis: 1000n,
        lockingBytecode: hexToBin(treasuryScript),
        token: { category: hexToBin('44'.repeat(32)), amount: 1n },
      },
      { valueSatoshis: 60_000n, lockingBytecode: hexToBin(sourceScript) },
    );
    const bytes = encodeTransactionBCH(parent);
    const first = {
      ...native,
      txId: hashTransaction(bytes),
      parentTransactionHex: binToHex(bytes),
    };
    const second = { ...first, index: 2, value: 60_000n };
    const result = generateBitcoinCashUnsignedLock(
      request({ amount: 120_000n, utxos: [first, second] }),
    );
    expect(result.selectedUtxos.map(({ index }) => index)).toEqual([0, 2]);
  });
});

describe('generateBitcoinCashLockFee', () => {
  /**
   * @target generateBitcoinCashLockFee rejects invalid estimate %#
   * @dependencies Actual shared metadata codec; no mocks.
   * @scenario Alter one count or integer fee-rate bound.
   * @expected Rejection before an invalid fee can reach min/max calculations.
   */
  it.each([
    { inputCount: 0, feeRate: 1 },
    { inputCount: 101, feeRate: 1 },
    { inputCount: 1.5, feeRate: 1 },
    { inputCount: 1, feeRate: 0 },
    { inputCount: 1, feeRate: 1.5 },
    { inputCount: 1, feeRate: Number.MAX_SAFE_INTEGER },
  ])('rejects invalid estimate %#', (change) => {
    expect(() => generateBitcoinCashLockFee({ ...request(), ...change })).toThrow();
  });
});
