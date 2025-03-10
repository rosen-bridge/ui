import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface Params {
  eventIds: string[];
}

const ParamsSchema = Joi.object<Params>().keys({
  eventIds: Joi.array().items(Joi.string().length(64)).default([]),
});

export const validator = async (request: NextRequest) => {
  return ParamsSchema.validate(await request.json());
};
