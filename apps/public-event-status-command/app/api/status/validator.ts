import { NextRequest } from 'next/server';

import {
  EventStatus,
  eventStatuses,
  TxType,
  TxStatus,
  txStatuses,
  txTypes,
} from '@rosen-bridge/public-event-status-logic';
import Joi from 'joi';

export interface Params {
  date: Date;
  eventId: string;
  status: EventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: TxStatus;
  pk: string;
  signature: string;
}

const ParamsSchema = Joi.object<Params>().keys({
  date: Joi.date().timestamp('unix').required(),
  eventId: Joi.string().length(64).required(),
  status: Joi.string()
    .valid(...eventStatuses)
    .required(),
  txId: Joi.string().length(64).optional(),
  txType: Joi.string()
    .valid(...txTypes)
    .optional(),
  txStatus: Joi.string()
    .valid(...txStatuses)
    .optional(),
  pk: Joi.string().length(66).required(),
  signature: Joi.string().required(), // TODO: validation?
});

export const validator = async (request: NextRequest) => {
  return ParamsSchema.validate(await request.json());
};
