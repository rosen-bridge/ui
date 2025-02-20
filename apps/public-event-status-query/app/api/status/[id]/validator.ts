import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface Params {
  id: string;
}

const ParamsSchema = Joi.object<Params>().keys({
  id: Joi.string().length(64).required(),
});

export const validator = async (request: NextRequest, params: any) => {
  return ParamsSchema.validate(params);
};
