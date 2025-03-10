import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface Params {
  id: string;
  guardPks: string[];
}

const ParamsSchema = Joi.object<Params>().keys({
  id: Joi.string().required().length(64),
  guardPks: Joi.array().items(Joi.string().length(66)).default([]),
});

export const validator = async (request: NextRequest, params: any) => {
  return ParamsSchema.validate({
    id: params?.id,
    guardPks: (await request.json()).guardPks,
  });
};
