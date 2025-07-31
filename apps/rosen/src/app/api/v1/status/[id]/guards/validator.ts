import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetGuardStatusTimelineRouteParam {
  id: string;
  skip: number;
  take: number;
}

/**
 * merged request body and `id` route param
 */
export interface GetGuardStatusTimelineParams {
  id: string;
  guardPks: string[];
  skip: number;
  take: number;
}

const ParamsSchema = Joi.object<GetGuardStatusTimelineParams>().keys({
  id: Joi.string().required().length(64),
  guardPks: Joi.array().items(Joi.string().length(66)).default([]), // compressed ECDSA public key is used which is 66 bytes
  skip: Joi.number().integer().min(0),
  take: Joi.number().integer().min(10).max(100),
});

export const validator = async (
  request: NextRequest,
  context?: { params: GetGuardStatusTimelineRouteParam },
) => {
  const { searchParams } = new URL(request.url);

  return ParamsSchema.validate({
    id: context?.params.id,
    guardPks: (await request.json()).guardPks,
    skip: searchParams.get('skip') ?? 0,
    take: searchParams.get('take') ?? 20,
  });
};
