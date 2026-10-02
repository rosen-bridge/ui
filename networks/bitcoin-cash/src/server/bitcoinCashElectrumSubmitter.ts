import { binToHex, decodeTransactionBCH, hexToBin } from '@bitauth/libauth';

import { isNetworkAvailable, NETWORKS } from '@rosen-ui/constants';

import { type BitcoinCashUnsignedLock, generateBitcoinCashLockFee } from '../generateUnsignedTx.js';
import { type BitcoinCashLockMetadata, generateBitcoinCashLockMetadata } from '../metadata.js';
import { validateBitcoinCashSignedLock } from '../validateSignedTx.js';
import {
  authenticateBitcoinCashElectrumSession,
  bitcoinCashSourceScript,
  readBitcoinCashSpendableUtxosOnSession,
} from './bitcoinCashElectrumProvider.js';
import { type BitcoinCashElectrumOptions, BitcoinCashElectrumSession } from './electrumSession.js';

/** Operator policy supplied exclusively by trusted server configuration. */
export interface BitcoinCashSubmissionPolicy {
  lockAddress: string;
  feeRate: number;
  maxFee: bigint;
  allowedDestinationChains: readonly string[];
}

/** Clones bounded operator policy and rejects unassigned or noncanonical route keys. */
const submissionPolicy = (
  policy: BitcoinCashSubmissionPolicy,
): Readonly<BitcoinCashSubmissionPolicy> => {
  try {
    bitcoinCashSourceScript(policy.lockAddress);
    if (
      !Number.isSafeInteger(policy.feeRate) ||
      policy.feeRate < 1 ||
      typeof policy.maxFee !== 'bigint' ||
      policy.maxFee < 1n ||
      policy.maxFee > 2_100_000_000_000_000n ||
      !Array.isArray(policy.allowedDestinationChains) ||
      policy.allowedDestinationChains.length < 1 ||
      policy.allowedDestinationChains.length > Object.keys(NETWORKS).length ||
      new Set(policy.allowedDestinationChains).size !== policy.allowedDestinationChains.length ||
      policy.allowedDestinationChains.some(
        (chain) =>
          typeof chain !== 'string' || !isNetworkAvailable(chain) || NETWORKS[chain].key !== chain,
      )
    )
      throw new Error('Invalid policy fields');
    return Object.freeze({
      lockAddress: policy.lockAddress,
      feeRate: policy.feeRate,
      maxFee: policy.maxFee,
      allowedDestinationChains: Object.freeze([...policy.allowedDestinationChains]),
    });
  } catch {
    throw new Error('Invalid BCH server submission policy');
  }
};

/** Copies every signing-intent field before asynchronous network work can begin. */
const copyIntent = (intent: BitcoinCashUnsignedLock): BitcoinCashUnsignedLock => {
  if (
    !Array.isArray(intent.selectedUtxos) ||
    intent.selectedUtxos.length < 1 ||
    intent.selectedUtxos.length > 100
  )
    throw new Error('Invalid bounded BCH submission intent');
  return Object.freeze({
    unsignedTransactionHex: intent.unsignedTransactionHex,
    fee: intent.fee,
    amount: intent.amount,
    fromAddress: intent.fromAddress,
    lockAddress: intent.lockAddress,
    selectedUtxos: Object.freeze(
      intent.selectedUtxos.map((utxo) =>
        Object.freeze({
          txId: utxo.txId,
          index: utxo.index,
          value: utxo.value,
          scriptPubKey: utxo.scriptPubKey,
          parentTransactionHex: utxo.parentTransactionHex,
          height: utxo.height,
          confirmations: utxo.confirmations,
          coinbase: utxo.coinbase,
        }),
      ),
    ),
  });
};

/** Dedicated native deposit submitter; reader sessions have no broadcast capability. */
class BitcoinCashElectrumSubmitter {
  /** Stores cloned server endpoint and immutable operator authorization policy. */
  constructor(
    private readonly options: BitcoinCashElectrumOptions,
    private readonly policy: Readonly<BitcoinCashSubmissionPolicy>,
  ) {}

  /**
   * Authorizes signed bytes, rechecks current inputs, then emits a single broadcast.
   * @param signedHex Wallet-supplied native Schnorr-signed transaction bytes.
   * @param intent Unsigned builder intent with authenticated complete parent contexts.
   * @param expectedMetadata Route, destination and Rosen fees resolved by a trusted server.
   * @param signal Optional caller cancellation; stops pending work before emission.
   * @param absoluteDeadline Optional trusted enclosing deadline in Unix milliseconds.
   * @returns The transaction ID only after an exact matching broadcast response.
   * @throws For policy, signature, parent, snapshot or transport failure.
   * @remarks Expected metadata and policy must never be accepted as user authority.
   * The indexer remains trusted for unspent status and height. A failed response
   * after broadcast may be ambiguous; this method never reconnects or resubmits.
   */
  submit = async (
    signedHex: string,
    intent: BitcoinCashUnsignedLock,
    expectedMetadata: BitcoinCashLockMetadata,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<string> => {
    if (signal?.aborted) throw new Error('BCH submission cancelled');
    if (absoluteDeadline !== undefined) {
      if (!Number.isSafeInteger(absoluteDeadline) || absoluteDeadline < 1)
        throw new Error('Invalid BCH submission deadline');
      if (Date.now() >= absoluteDeadline) throw new Error('BCH submission deadline expired');
    }
    let frozenIntent: BitcoinCashUnsignedLock;
    let validated: ReturnType<typeof validateBitcoinCashSignedLock>;
    try {
      frozenIntent = copyIntent(intent);
      if (
        frozenIntent.lockAddress !== this.policy.lockAddress ||
        !this.policy.allowedDestinationChains.includes(expectedMetadata.toChain)
      )
        throw new Error('Unauthorized policy');
      const metadata = generateBitcoinCashLockMetadata(expectedMetadata);
      const expectedFee = generateBitcoinCashLockFee({
        ...expectedMetadata,
        inputCount: frozenIntent.selectedUtxos.length,
        feeRate: this.policy.feeRate,
      });
      validated = validateBitcoinCashSignedLock(signedHex, frozenIntent);
      const unsigned = decodeTransactionBCH(hexToBin(frozenIntent.unsignedTransactionHex));
      if (
        typeof unsigned === 'string' ||
        binToHex(unsigned.outputs[1].lockingBytecode) !== binToHex(metadata) ||
        validated.fee !== expectedFee ||
        validated.fee > this.policy.maxFee
      )
        throw new Error('Unauthorized metadata or fee');
    } catch {
      throw new Error('Invalid BCH submission authorization or signed transaction');
    }
    const session = await BitcoinCashElectrumSession.openForSubmission(
      this.options,
      signal,
      absoluteDeadline,
    );
    try {
      await authenticateBitcoinCashElectrumSession(session);
      const current = await readBitcoinCashSpendableUtxosOnSession(
        session,
        frozenIntent.fromAddress,
      );
      const outpoints = new Map(current.map((utxo) => [`${utxo.txId}.${utxo.index}`, utxo]));
      for (const selected of frozenIntent.selectedUtxos) {
        session.checkDeadline();
        const fresh = outpoints.get(`${selected.txId}.${selected.index}`);
        if (
          !fresh ||
          fresh.value !== selected.value ||
          fresh.scriptPubKey !== selected.scriptPubKey ||
          fresh.parentTransactionHex !== selected.parentTransactionHex ||
          fresh.coinbase !== selected.coinbase
        )
          throw new Error('BCH submission inputs are no longer eligible');
      }
      session.checkDeadline();
      return await session.broadcastValidated(validated.signedTransactionHex, validated.txId);
    } finally {
      session.close();
    }
  };
}

/**
 * Creates a dedicated submitter from trusted server endpoint and operator policy.
 * @param options Certificate-verified TLS endpoint and finite operation deadline.
 * @param policy Canonical treasury, integer fee rate, maximum raw fee and assigned routes.
 * @returns A submit method that validates and rechecks before its one-shot broadcast.
 */
export const createBitcoinCashElectrumSubmitter = (
  options: BitcoinCashElectrumOptions,
  policy: BitcoinCashSubmissionPolicy,
): BitcoinCashElectrumSubmitter =>
  new BitcoinCashElectrumSubmitter({ ...options }, submissionPolicy(policy));
