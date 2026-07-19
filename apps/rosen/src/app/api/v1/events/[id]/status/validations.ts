import type { NextRequest } from 'next/server';

import Joi from 'joi';

export type GetEventStatusParams = {
  id: string;
  triggerTxId?: string;
  guardPublicKey?: string;
};

const ParamsSchema = Joi.object<GetEventStatusParams>().keys({
  id: Joi.string().required(),
  triggerTxId: Joi.string(),
  guardPublicKey: Joi.string().hex().length(66),
});

export const validateGet = async (
  request: NextRequest,
  context: { params: Promise<GetEventStatusParams> },
) => {
  return ParamsSchema.validate(
    Object.assign(
      {},
      await context.params,
      Object.fromEntries(request.nextUrl.searchParams),
    ),
  );
};
