import { z } from 'zod';

import { ECDSA } from '@rosen-bridge/encryption';
import {
  type EventStatus,
  eventStatuses,
  type TxStatus,
  type TxType,
  txStatuses,
  txTypes,
} from '@rosen-ui/public-status';

import { defineRoute } from '@/app/api/defineRoute';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';
import { publicStatusConfigs } from '@/backend/status/services';
import { AccessDeniedError } from '@/errors';

const body = z
  .object({
    date: z.preprocess((value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return new Date(value * 1000);
      if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
        return new Date(Number(value) * 1000);
      }
      return value;
    }, z.date()),
    triggerTxId: z.hex().length(64),
    eventId: z.hex().length(64),
    status: z.enum(eventStatuses as [EventStatus, ...EventStatus[]]),
    tx: z
      .object({
        txId: z.string().regex(/^(?:0x)?[a-fA-F0-9]{64}$/),
        chain: z.string().min(1).max(20),
        txType: z.enum(txTypes as [TxType, ...TxType[]]),
        txStatus: z.enum(txStatuses as [TxStatus, ...TxStatus[]]),
      })
      .strict()
      .optional(),
    pk: z.hex().length(66),
    signature: z.hex().length(128),
  })
  .strict();

PublicStatusAction.init(dataSource);

// generating an ECDSA encryption object with no secret only for verification
const ecdsa = new ECDSA('');

export const POST = defineRoute({
  schema: { body },
  handler: async ({ input }) => {
    const params = input.body;

    // check if pk is allowed
    if (!publicStatusConfigs.allowedPks.includes(params.pk)) {
      throw new AccessDeniedError('public key not allowed');
    }

    // check timestamp
    const timestampSeconds = Math.floor(params.date.getTime() / 1000);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      nowSeconds < timestampSeconds ||
      nowSeconds - timestampSeconds >= publicStatusConfigs.timeoutThresholdSeconds
    ) {
      throw new AccessDeniedError('invalid timestamp');
    }

    const txData = params.tx
      ? `${params.tx.txId}${params.tx.chain}${params.tx.txType}${params.tx.txStatus}`
      : '';

    const message = `${params.triggerTxId}${params.eventId}${params.status}${txData}${timestampSeconds}`;

    // verify signature
    const verified = await ecdsa.verify(message, params.signature, params.pk);
    if (!verified) {
      throw new AccessDeniedError('signature verification failed');
    }

    await PublicStatusAction.getInstance().insertStatus(
      params.eventId,
      params.triggerTxId,
      params.pk,
      nowSeconds,
      params.status,
      publicStatusConfigs.eventStatusThresholds,
      publicStatusConfigs.txStatusThresholds,
      params.tx,
    );

    return { ok: true };
  },
});
