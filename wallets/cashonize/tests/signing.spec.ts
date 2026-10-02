import {
  binToHex,
  decodeTransactionBCH,
  encodeTransactionBCH,
  hashTransaction,
  hexToBin,
} from '@bitauth/libauth';
import { describe, expect, it } from 'vitest';

import {
  parentOutput,
  signIntent,
  signingIntent,
} from '../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import { createCashonizeSigningRequest, validateCashonizeSigningResponse } from '../src/signing';

/** Build native request parameters matching the real authenticated fixture builder. */
const parameters = () => {
  const intent = signingIntent();
  return {
    fromAddress: intent.fromAddress,
    lockAddress: intent.lockAddress,
    amount: intent.amount,
    feeRate: 2,
    maxFee: 10000n,
    toChain: 'ethereum',
    toAddress: `0x${'12'.repeat(20)}`,
    bridgeFee: 100n,
    networkFee: 100n,
    utxos: [parentOutput(1)],
  };
};

describe('createCashonizeSigningRequest', () => {
  /**
   * @target Strict Cashonize wire fields preserve exact native signing context.
   * @dependencies Real BCH builder, libauth decoder and public parent fixture.
   * @scenario Serialize an authenticated deposit intent into JSON-safe WC2-BCH fields.
   * @expected Explicit broadcast false, complete outpoint/value/script, no token/contract/parent payload.
   */
  it('serializes exact strict-schema source outputs without broadcasting', () => {
    const result = createCashonizeSigningRequest(parameters());
    const decoded = decodeTransactionBCH(hexToBin(result.intent.unsignedTransactionHex));
    if (typeof decoded === 'string') throw new Error(decoded);
    expect(result.request.broadcast).toEqual(false);
    expect(result.request.transaction).toEqual(result.intent.unsignedTransactionHex);
    expect(result.request.sourceOutputs).toEqual([
      {
        outpointIndex: decoded.inputs[0].outpointIndex,
        outpointTransactionHash: `<Uint8Array: 0x${binToHex(decoded.inputs[0].outpointTransactionHash)}>`,
        sequenceNumber: decoded.inputs[0].sequenceNumber,
        lockingBytecode: `<Uint8Array: 0x${result.intent.selectedUtxos[0].scriptPubKey}>`,
        unlockingBytecode: '<Uint8Array: 0x>',
        valueSatoshis: '<bigint: 100000n>',
      },
    ]);
    expect(JSON.stringify(result.request)).not.toContain('parentTransactionHex');
    expect(Object.isFrozen(result.request.sourceOutputs[0])).toEqual(true);
    expect(Object.isFrozen(result.request.sourceOutputs)).toEqual(true);
    expect(Object.isFrozen(result)).toEqual(true);
  });

  /**
   * @target No untrusted parent becomes a wallet signing request.
   * @dependencies Real builder parent authentication.
   * @scenario Change a parent value or raw transaction before request creation.
   * @expected Fail before producing any wire request.
   */
  it.each(['value', 'parent'])('rejects forged parent %s before serialization', (mutation) => {
    const request = parameters();
    if (mutation === 'value') request.utxos[0].value += 1n;
    else request.utxos[0].parentTransactionHex += '00';
    expect(() => createCashonizeSigningRequest(request)).toThrow();
  });
});

describe('validateCashonizeSigningResponse', () => {
  /**
   * @target Response ID and signed bytes are verified together.
   * @dependencies Real Schnorr signature and shared signed validator.
   * @scenario Validate a genuine response and independently change hash or signature.
   * @expected Accept the genuine response and reject each altered result.
   */
  it('checks the wallet claimed hash against cryptographically verified bytes', () => {
    const { intent } = createCashonizeSigningRequest(parameters());
    const signedTransaction = signIntent(intent);
    const signedTransactionHash = hashTransaction(hexToBin(signedTransaction));
    const trusted = validateCashonizeSigningResponse(
      { signedTransaction, signedTransactionHash },
      intent,
    );
    expect(trusted.txId).toEqual(signedTransactionHash);
    expect(() =>
      validateCashonizeSigningResponse(
        { signedTransaction, signedTransactionHash: '00'.repeat(32) },
        intent,
      ),
    ).toThrow('hash mismatch');
    const changed = decodeTransactionBCH(hexToBin(signedTransaction));
    if (typeof changed === 'string') throw new Error(changed);
    changed.inputs[0].unlockingBytecode[1] ^= 1;
    expect(() =>
      validateCashonizeSigningResponse(
        { signedTransaction: binToHex(encodeTransactionBCH(changed)), signedTransactionHash },
        intent,
      ),
    ).toThrow('Invalid BCH wallet signature');
  });

  /**
   * @target Response framing remains fail closed for non-object or malformed fields.
   * @dependencies Authenticated deposit fixture.
   * @scenario Return null, arrays, empty object, wrong field types or nonhex hash.
   * @expected Reject each response without SDK or wallet access.
   */
  it.each([
    null,
    [],
    {},
    { signedTransaction: 1, signedTransactionHash: '00'.repeat(32) },
    { signedTransaction: '', signedTransactionHash: 'zz'.repeat(32) },
  ])('rejects malformed response %#', (response) => {
    expect(() => validateCashonizeSigningResponse(response, signingIntent())).toThrow();
  });
});
