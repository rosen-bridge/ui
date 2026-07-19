import type { NextRequest } from 'next/server';

import Joi from 'joi';

import {
  type EventStatus,
  eventStatuses,
  type TxStatus,
  type TxType,
  txStatuses,
  txTypes,
} from '@rosen-ui/public-status';

export interface TxParams {
  txId: string;
  chain: string;
  txType: TxType;
  txStatus: TxStatus;
}

export interface Params {
  date: Date;
  triggerTxId: string;
  eventId: string;
  status: EventStatus;
  pk: string;
  signature: string;
  tx?: TxParams;
}

const TxSchema = Joi.object<TxParams>().keys({
  txId: Joi.string()
    .pattern(/^(?:0x)?[a-fA-F0-9]{64}$/)
    .required(),
  chain: Joi.string().min(1).max(20).required(),
  txType: Joi.string()
    .valid(...txTypes)
    .required(),
  txStatus: Joi.string()
    .valid(...txStatuses)
    .required(),
});

const ParamsSchema = Joi.object<Params>().keys({
  date: Joi.date().timestamp('unix').required(),
  triggerTxId: Joi.string().hex().length(64).required(),
  eventId: Joi.string().hex().length(64).required(),
  status: Joi.string()
    .valid(...eventStatuses)
    .required(),
  tx: TxSchema.optional(),
  pk: Joi.string().hex().length(66).required(),
  signature: Joi.string().hex().length(128).required(),
});

export const validator = async (request: NextRequest) => {
  return ParamsSchema.validate(await request.json());
};

export const paramsToSignMessage = (
  params: Params,
  timestampSeconds: number,
): string => {
  const txData = params.tx
    ? `${params.tx.txId}${params.tx.chain}${params.tx.txType}${params.tx.txStatus}`
    : '';
  return `${params.triggerTxId}${params.eventId}${params.status}${txData}${timestampSeconds}`;
};
