import {
  binToHex,
  createVirtualMachineBCH,
  decodeTransactionBCH,
  encodeTransactionBCH,
  hexToBin,
} from '@bitauth/libauth';
import { describe, expect, it } from 'vitest';

import { validateBitcoinCashSignedLock } from '../src/validateSignedTx';
import { signIntent, signingIntent } from './mocked/signing.mock';

describe('validateBitcoinCashSignedLock', () => {
  /**
   * @target validateBitcoinCashSignedLock validates the exact signed deposit, multiple inputs=%s
   * @dependencies Real builder, authenticated synthetic parents and libauth signatures.
   * @scenario Sign a one-input and a two-input native deposit intent.
   * @expected Frozen byte identity and exact native fee without network or wallet access.
   */
  it.each([false, true])('validates the exact signed deposit, multiple inputs=%s', (multiple) => {
    const intent = signingIntent(multiple);
    const signed = signIntent(intent);
    const result = validateBitcoinCashSignedLock(signed, intent);
    expect(result.signedTransactionHex).toEqual(signed);
    expect(result.fee).toEqual(intent.fee);
    expect(result.txId).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.isFrozen(result)).toEqual(true);
    const decoded = decodeTransactionBCH(hexToBin(signed));
    if (typeof decoded === 'string') throw new Error(decoded);
    expect(
      createVirtualMachineBCH().verify({
        transaction: decoded,
        sourceOutputs: intent.selectedUtxos.map((utxo) => ({
          valueSatoshis: utxo.value,
          lockingBytecode: hexToBin(utxo.scriptPubKey),
        })),
      }),
    ).toEqual(true);
  });

  /**
   * @target validateBitcoinCashSignedLock rejects an invalid second signature
   * @dependencies Two-input signed fixture and reference BCH virtual machine.
   * @scenario Corrupt only the second signature while retaining the first signature and body.
   * @expected Both independent verification paths reject the transaction.
   */
  it('rejects an invalid second signature', () => {
    const intent = signingIntent(true);
    const decoded = decodeTransactionBCH(hexToBin(signIntent(intent)));
    if (typeof decoded === 'string') throw new Error(decoded);
    decoded.inputs[1].unlockingBytecode[1] ^= 1;
    expect(() =>
      validateBitcoinCashSignedLock(binToHex(encodeTransactionBCH(decoded)), intent),
    ).toThrow('Invalid BCH wallet signature');
    expect(
      createVirtualMachineBCH().verify({
        transaction: decoded,
        sourceOutputs: intent.selectedUtxos.map((utxo) => ({
          valueSatoshis: utxo.value,
          lockingBytecode: hexToBin(utxo.scriptPubKey),
        })),
      }),
    ).not.toEqual(true);
  });

  /**
   * @target validateBitcoinCashSignedLock rejects invalid unlocking %s
   * @dependencies Real signed fixture and single-field byte mutations.
   * @scenario Alter a signature byte, sighash flag, key, key prefix or push encoding.
   * @expected Reject each mutation even when the unsigned transaction body is unchanged.
   */
  it.each(['signature', 'sighash', 'key', 'keyPrefix', 'push', 'extra', 'unsigned'])(
    'rejects invalid unlocking %s',
    (mutation) => {
      const intent = signingIntent();
      const signed = decodeTransactionBCH(hexToBin(signIntent(intent)));
      if (typeof signed === 'string') throw new Error(signed);
      const unlocking = signed.inputs[0].unlockingBytecode;
      if (mutation === 'signature') unlocking[1] ^= 1;
      if (mutation === 'sighash') unlocking[65] = 0x61;
      if (mutation === 'key') unlocking[68] ^= 1;
      if (mutation === 'keyPrefix') unlocking[67] = 4;
      if (mutation === 'push') unlocking[0] = 0x4c;
      if (mutation === 'extra') signed.inputs[0].unlockingBytecode = Uint8Array.of(...unlocking, 0);
      if (mutation === 'unsigned') signed.inputs[0].unlockingBytecode = new Uint8Array();
      expect(() =>
        validateBitcoinCashSignedLock(binToHex(encodeTransactionBCH(signed)), intent),
      ).toThrow();
    },
  );

  /**
   * @target validateBitcoinCashSignedLock rejects changed body %s
   * @dependencies Real signed fixture and independent unsigned field changes.
   * @scenario Change version, locktime, outpoint, sequence, treasury value, change, metadata, or outputs count.
   * @expected Reject each body mutation before accepting signatures.
   */
  it.each([
    'version',
    'locktime',
    'outpoint',
    'sequence',
    'amount',
    'change',
    'metadata',
    'outputs',
  ])('rejects changed body %s', (mutation) => {
    const intent = signingIntent();
    const signed = decodeTransactionBCH(hexToBin(signIntent(intent)));
    if (typeof signed === 'string') throw new Error(signed);
    if (mutation === 'version') signed.version = 1;
    if (mutation === 'locktime') signed.locktime = 1;
    if (mutation === 'outpoint') signed.inputs[0].outpointIndex = 1;
    if (mutation === 'sequence') signed.inputs[0].sequenceNumber = 1;
    if (mutation === 'amount') signed.outputs[0].valueSatoshis += 1n;
    if (mutation === 'change') signed.outputs[2].valueSatoshis -= 1n;
    if (mutation === 'metadata') signed.outputs[1].lockingBytecode[3] ^= 1;
    if (mutation === 'outputs') signed.outputs.pop();
    expect(() =>
      validateBitcoinCashSignedLock(binToHex(encodeTransactionBCH(signed)), intent),
    ).toThrow();
  });

  /**
   * @target validateBitcoinCashSignedLock rejects forged intent %s
   * @dependencies Real builder intent with independently forged metadata fields.
   * @scenario Change intent amount, fee, source, parent bytes, output value, maturity or add a duplicate input.
   * @expected Reject rather than relying on freezing or TypeScript types as authority.
   */
  it.each(['amount', 'fee', 'source', 'parent', 'value', 'maturity', 'duplicate'])(
    'rejects forged intent %s',
    (mutation) => {
      const original = signingIntent();
      const signed = signIntent(original);
      const intent = {
        ...original,
        selectedUtxos: original.selectedUtxos.map((utxo) => ({ ...utxo })),
      };
      if (mutation === 'amount') intent.amount += 1n;
      if (mutation === 'fee') intent.fee += 1n;
      if (mutation === 'source') intent.fromAddress = intent.lockAddress;
      if (mutation === 'parent') intent.selectedUtxos[0].parentTransactionHex += '00';
      if (mutation === 'value') intent.selectedUtxos[0].value += 1n;
      if (mutation === 'maturity') intent.selectedUtxos[0].confirmations = 0;
      if (mutation === 'duplicate') intent.selectedUtxos.push(intent.selectedUtxos[0]);
      expect(() => validateBitcoinCashSignedLock(signed, intent)).toThrow();
    },
  );

  /**
   * @target validateBitcoinCashSignedLock rejects malformed signed bytes %#
   * @dependencies Native signing intent.
   * @scenario Supply empty, odd, nonhex, oversized or trailing transaction data.
   * @expected Reject every malformed frame before signature validation.
   */
  it.each(['', '0', 'zz', '00'.repeat(100001)])('rejects malformed signed bytes %#', (value) => {
    expect(() => validateBitcoinCashSignedLock(value, signingIntent())).toThrow();
  });
});
