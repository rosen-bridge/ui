'use server';

import { createHash } from 'node:crypto';

import { z } from 'zod';

import { generateOpReturnData } from '@rosen-network/firo';
import { NETWORKS } from '@rosen-ui/constants';

import { LOCK_ADDRESSES } from '../../../configs';
import { transparentP2pkhScript } from './address';
import { zcashRpc } from './rpc';

const hex64 = z.string().regex(/^[0-9a-f]{64}$/);
const decimal = z.string().regex(/^(0|[1-9][0-9]*)$/);
const intentSchema = z.strictObject({
  type: z.literal('rosen-zcash-lock-intent'),
  version: z.literal(1),
  requestId: z.uuid(),
  source: z.strictObject({
    chain: z.literal('zcash'),
    network: z.enum(['mainnet', 'testnet', 'regtest']),
    genesisHash: hex64,
  }),
  reserveAddress: z.string().min(30).max(80),
  amountZat: decimal,
  target: z.strictObject({ chain: z.literal('ergo'), address: z.string().min(30).max(100) }),
  fees: z.strictObject({ bridgeFee: decimal, networkFee: decimal }),
  rosenDataHex: z.string().regex(/^00[0-9a-f]{32}21(?:02|03)[0-9a-f]{64}$/),
  createdAt: z.string(),
  expiresAt: z.string(),
});

const receiptSchema = z.strictObject({
  type: z.literal('rosen-zcash-lock-receipt'),
  version: z.literal(1),
  requestId: z.uuid(),
  intentSha256: hex64,
  sourceGenesisHash: hex64,
  txid: hex64,
  rawTxSha256: hex64,
  status: z.literal('submitted'),
});

interface ObservedOutput {
  valueZat: number;
  scriptPubKey: { hex: string; addresses?: string[] };
}

interface ObservedTransaction {
  txid: string;
  hex: string;
  in_active_chain: boolean;
  confirmations: number;
  vin: Array<{ txid?: string; coinbase?: string }>;
  vout: ObservedOutput[];
  vShieldedSpend: unknown[];
  vShieldedOutput: unknown[];
  vjoinsplit: unknown[];
  orchard: { actions: unknown[]; valueBalanceZat: number };
  ironwood?: { actions: unknown[]; valueBalanceZat: number };
  valueBalanceZat: number;
}

/** Read-only confirmation check. A receipt is a claim until the node independently returns this transaction. */
export async function verifyZcashLockReceipt(
  intentJson: string,
  receiptJson: string,
): Promise<{ txid: string; confirmations: number }> {
  if (intentJson.length > 16_384 || receiptJson.length > 4_096) {
    throw new Error('Zcash intent or receipt is too large');
  }
  const intent = intentSchema.parse(JSON.parse(intentJson));
  const receipt = receiptSchema.parse(JSON.parse(receiptJson));
  const intentDigest = createHash('sha256').update(Buffer.from(intentJson, 'utf8')).digest('hex');
  if (
    receipt.requestId !== intent.requestId ||
    receipt.intentSha256 !== intentDigest ||
    receipt.sourceGenesisHash !== intent.source.genesisHash
  ) {
    throw new Error('The Zcash receipt does not match the exported intent');
  }
  if (
    !LOCK_ADDRESSES.zcash || intent.reserveAddress !== LOCK_ADDRESSES.zcash ||
    intent.source.network !== process.env.ZCASH_NETWORK ||
    intent.source.genesisHash !== process.env.ZCASH_GENESIS_HASH
  ) {
    throw new Error('The Zcash reserve or network configuration changed');
  }
  const createdAt = Date.parse(intent.createdAt);
  const expiresAt = Date.parse(intent.expiresAt);
  if (!Number.isFinite(createdAt) || !Number.isFinite(expiresAt) || expiresAt <= createdAt) {
    throw new Error('Invalid Zcash intent timestamps');
  }
  const amount = BigInt(intent.amountZat);
  const bridgeFee = BigInt(intent.fees.bridgeFee);
  const networkFee = BigInt(intent.fees.networkFee);
  if (amount <= bridgeFee + networkFee || amount > 2_100_000_000_000_000n) {
    throw new Error('Invalid Zcash lock amount or Rosen fees');
  }
  const expectedData = await generateOpReturnData(
    NETWORKS.ergo.key,
    intent.target.address,
    intent.fees.networkFee,
    intent.fees.bridgeFee,
  );
  if (intent.rosenDataHex !== expectedData) {
    throw new Error('Zcash Rosen data differs from the destination or fees');
  }

  const genesisHash = await zcashRpc<string>('getblockhash', [0]);
  if (genesisHash !== intent.source.genesisHash) throw new Error('Zcash node is on another network');
  const tx = await zcashRpc<ObservedTransaction>('getrawtransaction', [receipt.txid, 1]);
  if (
    tx.txid !== receipt.txid || tx.in_active_chain !== true ||
    !Number.isSafeInteger(tx.confirmations) || tx.confirmations < 1 ||
    typeof tx.hex !== 'string' || !/^(?:[0-9a-f]{2})+$/.test(tx.hex) ||
    tx.hex.length > 8_000_000 || !Array.isArray(tx.vin) || tx.vin.length < 1 ||
    tx.vin.some((input) => !hex64.safeParse(input.txid).success || input.coinbase !== undefined) ||
    !Array.isArray(tx.vout) || !Array.isArray(tx.vShieldedSpend) ||
    !Array.isArray(tx.vShieldedOutput) || !Array.isArray(tx.vjoinsplit) ||
    tx.vShieldedSpend.length !== 0 || tx.vShieldedOutput.length !== 0 ||
    tx.vjoinsplit.length !== 0 || !Array.isArray(tx.orchard?.actions) ||
    tx.orchard.actions.length !== 0 || tx.orchard.valueBalanceZat !== 0 ||
    (tx.ironwood !== undefined &&
      (!Array.isArray(tx.ironwood?.actions) ||
        tx.ironwood.actions.length !== 0 ||
        tx.ironwood.valueBalanceZat !== 0)) ||
    tx.valueBalanceZat !== 0
  ) {
    throw new Error('Zcash transaction is not a confirmed transparent lock');
  }
  const rawDigest = createHash('sha256').update(Buffer.from(tx.hex, 'hex')).digest('hex');
  if (rawDigest !== receipt.rawTxSha256) {
    throw new Error('Zcash receipt raw transaction digest mismatch');
  }
  const expectedReserveScript = transparentP2pkhScript(intent.reserveAddress, intent.source.network);
  const reserveOutputs = tx.vout.filter(
    (output) => output.scriptPubKey?.hex === expectedReserveScript,
  );
  const markerOutputs = tx.vout.filter((output) => output.scriptPubKey?.hex?.startsWith('6a'));
  if (
    reserveOutputs.length !== 1 || markerOutputs.length !== 1 ||
    !Number.isSafeInteger(reserveOutputs[0].valueZat) ||
    BigInt(reserveOutputs[0].valueZat) !== amount ||
    !reserveOutputs[0].scriptPubKey.addresses?.includes(intent.reserveAddress) ||
    markerOutputs[0].valueZat !== 0 ||
    markerOutputs[0].scriptPubKey.hex !== `6a33${intent.rosenDataHex}`
  ) {
    throw new Error('Zcash transaction does not match the reserve, amount, and Rosen data');
  }
  return { txid: receipt.txid, confirmations: tx.confirmations };
}
