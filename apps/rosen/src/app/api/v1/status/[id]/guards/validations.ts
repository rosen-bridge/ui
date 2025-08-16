import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetGuardStatusTimelineRouteParam {
  id: string;
  offset: number;
  limit: number;
}

/**
 * merged request body and `id` route param
 */
export interface GetGuardStatusTimelineParams {
  id: string;
  guardPks: string[];
  offset: number;
  limit: number;
}

const ParamsSchema = Joi.object<GetGuardStatusTimelineParams>().keys({
  id: Joi.string().required().length(64),
  guardPks: Joi.array().items(Joi.string().length(66)).default([]), // compressed ECDSA public key is used which is 66 bytes
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(10).max(100).default(10),
});

export const validator = async (
  request: NextRequest,
  context?: { params: GetGuardStatusTimelineRouteParam },
) => {
  return ParamsSchema.validate(
    Object.assign(Object.fromEntries(request.nextUrl.searchParams), {
      id: context?.params.id,
      guardPks: (await request.json()).guardPks,
    }),
  );
};
