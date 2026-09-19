import type { NextRequest } from 'next/server';

import { z } from 'zod';

import {
  type EventStatus,
  eventStatuses,
  type TxStatus,
  type TxType,
  txStatuses,
  txTypes,
} from '@rosen-ui/public-status';

const TxSchema = z
  .object({
    txId: z.string().regex(/^(?:0x)?[a-fA-F0-9]{64}$/),
    chain: z.string().min(1).max(20),
    txType: z.enum(txTypes as [TxType, ...TxType[]]),
    txStatus: z.enum(txStatuses as [TxStatus, ...TxStatus[]]),
  })
  .strict();

export type TxParams = z.infer<typeof TxSchema>;

const ParamsSchema = z
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
    tx: TxSchema.optional(),
    pk: z.hex().length(66),
    signature: z.hex().length(128),
  })
  .strict();

export type Params = z.infer<typeof ParamsSchema>;

export const validator = async (request: NextRequest) => {
  return ParamsSchema.safeParse(await request.json());
};

export const paramsToSignMessage = (params: Params, timestampSeconds: number): string => {
  const txData = params.tx
    ? `${params.tx.txId}${params.tx.chain}${params.tx.txType}${params.tx.txStatus}`
    : '';
  return `${params.triggerTxId}${params.eventId}${params.status}${txData}${timestampSeconds}`;
};
