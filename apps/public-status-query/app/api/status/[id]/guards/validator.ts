import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetGuardStatusTimelineRouteParam {
  id: string;
}

/**
 * merged request body and `id` route param
 */
export interface GetGuardStatusTimelineParams {
  id: string;
  guardPks: string[];
}

const ParamsSchema = Joi.object<GetGuardStatusTimelineParams>().keys({
  id: Joi.string().required().length(64),
  guardPks: Joi.array().items(Joi.string().length(66)).default([]), // compressed ECDSA public key is used which is 66 bytes
});

export const validator = async (
  request: NextRequest,
  params: GetGuardStatusTimelineRouteParam,
) => {
  return ParamsSchema.validate({
    id: params.id,
    guardPks: (await request.json()).guardPks,
  });
};
