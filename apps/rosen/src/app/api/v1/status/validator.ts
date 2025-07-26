import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetAggregatedStatusesRequestBody {
  eventIds: string[];
}

const ParamsSchema = Joi.object<GetAggregatedStatusesRequestBody>().keys({
  eventIds: Joi.array()
    .items(Joi.string().length(64))
    .required()
    .min(1)
    .max(100),
});

export const validator = async (request: NextRequest) => {
  return ParamsSchema.validate(await request.json());
};
