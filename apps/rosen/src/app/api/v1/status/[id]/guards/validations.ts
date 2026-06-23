import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetGuardStatusTimelineParams {
  id: string;
  triggerTxId: string;
  guardPks: string[];
  offset: number;
  limit: number;
}

const ParamsSchema = Joi.object<GetGuardStatusTimelineParams>().keys({
  id: Joi.string().hex().required().length(64),
  triggerTxId: Joi.string().hex().required().length(64),
  guardPks: Joi.array().items(Joi.string().hex().length(66)).default([]), // compressed ECDSA public key is used which is 66 bytes
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const validator = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  const body = await request.json();
  return ParamsSchema.validate(
    Object.assign(Object.fromEntries(request.nextUrl.searchParams), {
      id: (await context.params)?.id,
      guardPks: body.guardPks,
      triggerTxId: body.triggerTxId,
    }),
  );
};
