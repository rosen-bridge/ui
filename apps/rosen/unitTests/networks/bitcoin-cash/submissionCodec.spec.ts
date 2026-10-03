import { describe, expect, it } from 'vitest';

import { validateBitcoinCashSignedLock } from '@rosen-network/bitcoin-cash';

import {
  signIntent,
  signingIntent,
} from '../../../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import {
  decodeBitcoinCashSubmission,
  encodeBitcoinCashSubmission,
} from '../../../src/networks/bitcoin-cash/submissionCodec';

/** Actual authenticated builder/signature fixture; codec performs framing rather than signature authority. */
const fixture = () => {
  const intent = signingIntent();
  return {
    intent,
    signedTransactionHex: signIntent(intent),
    destination: { toChain: 'ethereum', toAddress: `0x${'12'.repeat(20)}` },
  };
};

describe('encodeBitcoinCashSubmission', () => {
  /**
   * @target Exact primitive serialization preserves authenticated intent and signature bytes without BigInt loss.
   * @dependencies Actual native builder, Schnorr signer and shared downstream validator.
   * @scenario Encode and decode a valid signed deposit.
   * @expected Restore exact primitives/frozen context and pass real signature validation unchanged.
   */
  it('closes against the actual signed validator', () => {
    const original = fixture();
    const result = decodeBitcoinCashSubmission(encodeBitcoinCashSubmission(original));
    expect(result).toEqual(original);
    expect(Object.isFrozen(result.intent.selectedUtxos[0])).toEqual(true);
    expect(validateBitcoinCashSignedLock(result.signedTransactionHex, result.intent)).toEqual(
      validateBitcoinCashSignedLock(original.signedTransactionHex, original.intent),
    );
  });
  /**
   * @target Oversized source context is rejected before JSON serialization or transport.
   * @dependencies Actual fixture with independently oversized selected count, parent or signed text.
   * @scenario Supply 101 inputs, two over-budget parent copies, or more than 200000 signed hex characters.
   * @expected Reject each bounded encoding boundary.
   */
  it.each(['count', 'parents', 'signed'])('rejects oversized encoding %s', (mutation) => {
    const original = fixture();
    const intent = { ...original.intent, selectedUtxos: [...original.intent.selectedUtxos] };
    if (mutation === 'count')
      intent.selectedUtxos = Array.from({ length: 101 }, () => original.intent.selectedUtxos[0]);
    if (mutation === 'parents')
      intent.selectedUtxos = Array.from({ length: 3 }, () => ({
        ...original.intent.selectedUtxos[0],
        parentTransactionHex: '00'.repeat(999999),
      }));
    expect(() =>
      encodeBitcoinCashSubmission({
        ...original,
        intent,
        signedTransactionHex:
          mutation === 'signed' ? '00'.repeat(100001) : original.signedTransactionHex,
      }),
    ).toThrow();
  });
});

describe('decodeBitcoinCashSubmission', () => {
  /**
   * @target Strict transport schema rejects extra authority, lossy amounts and malformed primitive input assertions.
   * @dependencies Canonical serialized fixture with one independent wire mutation.
   * @scenario Change extra root/fee authority, amount forms, native script, count or index/height/coinbase fields.
   * @expected Reject each mutated frame before downstream quote or submission.
   */
  it.each([
    'extra',
    'feeAuthority',
    'number',
    'exponent',
    'negative',
    'leadingZero',
    'overflow',
    'script',
    'index',
    'height',
    'coinbase',
    'route',
    'empty',
  ])('rejects malformed wire %s', (mutation) => {
    const wire = JSON.parse(encodeBitcoinCashSubmission(fixture()));
    if (mutation === 'extra') wire.debug = 'not-allowed';
    if (mutation === 'feeAuthority') wire.destination.bridgeFee = '0';
    if (mutation === 'number') wire.intent.amount = 50000;
    if (mutation === 'exponent') wire.intent.amount = '5e4';
    if (mutation === 'negative') wire.intent.amount = '-1';
    if (mutation === 'leadingZero') wire.intent.amount = '050000';
    if (mutation === 'overflow') wire.intent.amount = '2100000000000001';
    if (mutation === 'script') wire.intent.selectedUtxos[0].scriptPubKey = '00'.repeat(25);
    if (mutation === 'index') wire.intent.selectedUtxos[0].index = 1.5;
    if (mutation === 'height') wire.intent.selectedUtxos[0].height = 0;
    if (mutation === 'coinbase') wire.intent.selectedUtxos[0].coinbase = 'false';
    if (mutation === 'route') wire.destination.toChain = 'BTC';
    if (mutation === 'empty') wire.intent.selectedUtxos = [];
    expect(() => decodeBitcoinCashSubmission(JSON.stringify(wire))).toThrow();
  });
  /**
   * @target Body framing is finite and ASCII, and malformed JSON never reaches protocol validators.
   * @dependencies Independently oversized, non-ASCII or malformed body.
   * @scenario Decode each invalid framing class.
   * @expected Reject before deriving submission intent.
   */
  it.each(['oversized', 'unicode', 'json'])('rejects invalid body %s', (mutation) => {
    const body =
      mutation === 'oversized' ? ' '.repeat(5_000_001) : mutation === 'unicode' ? 'é' : '{';
    expect(() => decodeBitcoinCashSubmission(body)).toThrow();
  });
});
