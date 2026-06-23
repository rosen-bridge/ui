import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetAggregatedStatusesRequestBody {
  eventAndTriggerIds: string[][]; // e.g. [ ["event-id-1", "trigger-tx-id-1"], ["event-id-2", "trigger-tx-id-2"] ]
}

const ParamsSchema = Joi.object<GetAggregatedStatusesRequestBody>().keys({
  eventAndTriggerIds: Joi.array()
    .required()
    .min(1)
    .max(100)
    .items(Joi.array().length(2).items(Joi.string().hex().length(64))),
});

export const validator = async (request: NextRequest) => {
  return ParamsSchema.validate(await request.json());
};
