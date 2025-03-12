import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface IdRouteParam {
  id: string;
}

export interface Params {
  id: string;
  guardPks: string[];
}

const ParamsSchema = Joi.object<Params>().keys({
  id: Joi.string().required().length(64),
  guardPks: Joi.array().items(Joi.string().length(66)).default([]), // compressed ECDSA public key is used which is 66 bytes
});

export const validator = async (request: NextRequest, params: IdRouteParam) => {
  return ParamsSchema.validate({
    id: params.id,
    guardPks: (await request.json()).guardPks,
  });
};
