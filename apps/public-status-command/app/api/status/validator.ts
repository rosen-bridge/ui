import { NextRequest } from 'next/server';

import {
  EventStatus,
  eventStatuses,
  TxType,
  TxStatus,
  txStatuses,
  txTypes,
} from '@rosen-bridge/public-status-logic';
import Joi from 'joi';

export interface TxParams {
  txId: string;
  chain: string;
  txType: TxType;
  txStatus: TxStatus;
}

export interface Params {
  date: Date;
  eventId: string;
  status: EventStatus;
  pk: string;
  signature: string;
  tx?: TxParams;
}

const TxSchema = Joi.object<TxParams>().keys({
  txId: Joi.string().length(64).required(),
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
  eventId: Joi.string().length(64).required(),
  status: Joi.string()
    .valid(...eventStatuses)
    .required(),
  tx: TxSchema.optional(),
  pk: Joi.string().length(66).required(),
  signature: Joi.string().required(), // TODO: validation?
});

export const validator = async (request: NextRequest) => {
  return ParamsSchema.validate(await request.json());
};
