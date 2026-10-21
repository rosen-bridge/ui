import { binToHex, decodeTransactionBCH, hexToBin } from '@bitauth/libauth';

import {
  type BitcoinCashUnsignedLock,
  type BitcoinCashUnsignedLockRequest,
  generateBitcoinCashUnsignedLock,
  validateBitcoinCashSignedLock,
} from '@rosen-network/bitcoin-cash';

/** Cashonize's strict WC2-BCH source output wire representation. */
export interface CashonizeSourceOutput {
  readonly outpointIndex: number;
  readonly outpointTransactionHash: string;
  readonly sequenceNumber: number;
  readonly lockingBytecode: string;
  readonly unlockingBytecode: string;
  readonly valueSatoshis: string;
}

/** Native-only signing request; the wallet never broadcasts this request. */
export interface CashonizeSigningRequest {
  readonly transaction: string;
  readonly sourceOutputs: readonly CashonizeSourceOutput[];
  readonly broadcast: false;
}

/**
 * Rebuild an authenticated deposit and serialize Cashonize's strict signing payload.
 * @param parameters Raw satoshi deposit parameters and authenticated parent snapshot.
 * @returns Frozen intent and bounded WC2-BCH request with explicit broadcast false.
 * @throws For invalid native intent, selected parent context or oversized request.
 * @remarks Wallet and protocol pins are recorded in the BCH integration document.
 */
export const createCashonizeSigningRequest = (parameters: BitcoinCashUnsignedLockRequest) => {
  const intent = generateBitcoinCashUnsignedLock(parameters);
  if (
    intent.selectedUtxos.reduce((total, utxo) => total + utxo.parentTransactionHex.length, 0) >
    4_000_000
  )
    throw new Error('BCH signing parent context exceeds bound');
  const transaction = decodeTransactionBCH(hexToBin(intent.unsignedTransactionHex));
  if (typeof transaction === 'string') throw new Error('Invalid BCH unsigned signing transaction');
  const sourceOutputs = Object.freeze(
    transaction.inputs.map((input, index) =>
      Object.freeze({
        outpointIndex: input.outpointIndex,
        outpointTransactionHash: `<Uint8Array: 0x${binToHex(input.outpointTransactionHash)}>`,
        sequenceNumber: input.sequenceNumber,
        lockingBytecode: `<Uint8Array: 0x${intent.selectedUtxos[index].scriptPubKey}>`,
        unlockingBytecode: '<Uint8Array: 0x>',
        valueSatoshis: `<bigint: ${intent.selectedUtxos[index].value}n>`,
      }),
    ),
  );
  const request: CashonizeSigningRequest = Object.freeze({
    transaction: intent.unsignedTransactionHex,
    sourceOutputs,
    broadcast: false,
  });
  // All serialized values are ASCII. Bound before handing the payload to the relay SDK.
  if (JSON.stringify(request).length > 250_000) throw new Error('BCH wallet request exceeds bound');
  return Object.freeze({ intent, request });
};

/**
 * Validate the wallet's untrusted response before separate server submission.
 * @param response Cashonize bch_signTransaction result.
 * @param intent Original authenticated unsigned deposit intent.
 * @returns Cryptographically validated frozen transaction bytes, ID and fee.
 * @throws For malformed response, invalid transaction/signature or claimed hash mismatch.
 */
export const validateCashonizeSigningResponse = (
  response: unknown,
  intent: BitcoinCashUnsignedLock,
) => {
  if (response === null || typeof response !== 'object' || Array.isArray(response))
    throw new Error('Invalid BCH wallet response');
  const fields = response as Record<string, unknown>;
  if (
    typeof fields.signedTransaction !== 'string' ||
    typeof fields.signedTransactionHash !== 'string' ||
    !/^[0-9a-f]{64}$/.test(fields.signedTransactionHash)
  )
    throw new Error('Invalid BCH wallet response fields');
  const result = validateBitcoinCashSignedLock(fields.signedTransaction, intent);
  if (fields.signedTransactionHash !== result.txId)
    throw new Error('BCH wallet transaction hash mismatch');
  return result;
};
