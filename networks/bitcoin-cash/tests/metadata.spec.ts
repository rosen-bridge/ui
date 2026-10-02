import { describe, expect, it } from 'vitest';

import { generateBitcoinCashLockMetadata, generateBitcoinCashOpReturn } from '../src';

const metadata = {
  toChainIndex: 0,
  encodedAddressHex: `76a914${'01'.repeat(20)}88ac`,
  bridgeFee: 0x123n,
  networkFee: 0x456n,
};

/** Shared-codec destination fixture; fee values remain Rosen-normalized integers. */
const destinationMetadata = {
  toChain: 'ethereum',
  toAddress: `0x${'12'.repeat(20)}`,
  bridgeFee: 291n,
  networkFee: 1110n,
};

describe('generateBitcoinCashLockMetadata', () => {
  /**
   * @target Resolve Ethereum through the shared chain registry and address codec.
   * @dependencies Shared Rosen address codec and UI registry; neither mocked.
   * @scenario Generate BCH lock metadata for a valid EVM destination.
   * @expected Chain index three, 20 codec bytes and exact Rosen-normalized fee fields.
   */
  it('resolves the shared registry and address codec before serialization', () => {
    expect(generateBitcoinCashLockMetadata(destinationMetadata)).toEqual(
      generateBitcoinCashOpReturn({
        toChainIndex: 3,
        encodedAddressHex: '12'.repeat(20),
        bridgeFee: 291n,
        networkFee: 1110n,
      }),
    );
  });

  /**
   * @target Refuse BCH candidate and unknown destination identities.
   * @dependencies Shared UI registry; no mocks.
   * @scenario Change only the destination chain to each unassigned/unknown key.
   * @expected RangeError, without consuming a provisional chain index.
   */
  it.each(['bitcoin-cash', 'unknown', '__proto__'])(
    'refuses unavailable destination %s',
    (toChain) => {
      expect(() => generateBitcoinCashLockMetadata({ ...destinationMetadata, toChain })).toThrow(
        RangeError,
      );
    },
  );

  /**
   * @target Preserve shared-codec rejection of malformed destination addresses.
   * @dependencies Shared Rosen Ethereum codec; no mocks.
   * @scenario Change only the address to a short value.
   * @expected Error before OP_RETURN serialization succeeds.
   */
  it('rejects an address rejected by the shared codec', () => {
    expect(() =>
      generateBitcoinCashLockMetadata({ ...destinationMetadata, toAddress: '0x12' }),
    ).toThrow(Error);
  });
});

describe('generateBitcoinCashOpReturn', () => {
  /**
   * @target Preserve the shared Rosen byte order and canonical short push.
   * @dependencies None.
   * @scenario Serialize a 25-byte destination script and distinct uint64 fees.
   * @expected Exact chain/bridge/network/length/address bytes, without padding.
   */
  it('preserves the shared Rosen byte order and canonical short push', () => {
    expect(Buffer.from(generateBitcoinCashOpReturn(metadata)).toString('hex')).toEqual(
      `6a2b00000000000000012300000000000004561976a914${'01'.repeat(20)}88ac`,
    );
  });

  /**
   * @target Select the canonical push opcode at each payload-size boundary.
   * @dependencies None.
   * @scenario Serialize 75-, 76- and 80-byte payloads.
   * @expected Direct push through 75 bytes, OP_PUSHDATA1 for 76 and 80 bytes.
   */
  it.each([75, 76, 80])('selects canonical push at %i payload bytes', (length) => {
    const script = generateBitcoinCashOpReturn({
      ...metadata,
      encodedAddressHex: 'ab'.repeat(length - 18),
    });
    expect(Array.from(script.slice(0, length <= 75 ? 2 : 3))).toEqual(
      length <= 75 ? [0x6a, length] : [0x6a, 0x4c, length],
    );
    expect(script.length).toEqual(length + (length <= 75 ? 2 : 3));
  });

  /**
   * @target Preserve both uint64 fee endpoints without numeric coercion.
   * @dependencies None.
   * @scenario Serialize zero bridge fee and maximum network fee.
   * @expected Eight zero bytes and eight FF bytes in their respective fields.
   */
  it('preserves uint64 fee endpoints without numeric coercion', () => {
    const script = generateBitcoinCashOpReturn({
      ...metadata,
      bridgeFee: 0n,
      networkFee: 0xffffffffffffffffn,
    });
    expect(Array.from(script.slice(3, 11))).toEqual(Array(8).fill(0));
    expect(Array.from(script.slice(11, 19))).toEqual(Array(8).fill(255));
  });

  /**
   * @target Reject isolated invalid chain-index encodings.
   * @dependencies None.
   * @scenario Change only the chain index to negative, overflow or noninteger.
   * @expected RangeError before a script is returned.
   */
  it.each([-1, 256, 0.5, Number.NaN])('rejects chain index %s', (toChainIndex) => {
    expect(() => generateBitcoinCashOpReturn({ ...metadata, toChainIndex })).toThrow(RangeError);
  });

  /**
   * @target Reject each fee independently when outside uint64.
   * @dependencies None.
   * @scenario Change one fee field while retaining the other valid fields.
   * @expected RangeError for negative and overflowing bridge or network fees.
   */
  it.each([
    { bridgeFee: -1n },
    { bridgeFee: 0x10000000000000000n },
    { networkFee: -1n },
    { networkFee: 0x10000000000000000n },
  ])('rejects an out-of-range fee %s', (invalid) => {
    expect(() => generateBitcoinCashOpReturn({ ...metadata, ...invalid })).toThrow(RangeError);
  });

  /**
   * @target Reject malformed and oversized destination-byte encodings.
   * @dependencies None.
   * @scenario Change only encoded destination bytes to each invalid case.
   * @expected RangeError for empty, odd, nonhex and 81-byte payload cases.
   */
  it.each(['', 'a', 'gg', '00'.repeat(63)])(
    'rejects invalid destination bytes %s',
    (encodedAddressHex) => {
      expect(() => generateBitcoinCashOpReturn({ ...metadata, encodedAddressHex })).toThrow(
        RangeError,
      );
    },
  );
});
