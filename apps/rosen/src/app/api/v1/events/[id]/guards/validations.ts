import type { NextRequest } from 'next/server';

import Joi from 'joi';

export type GetEventGuardsStatusParams = {
  id: string;
  triggerTxId: string;
};

const ParamsSchema = Joi.object<GetEventGuardsStatusParams>().keys({
  id: Joi.string().required(),
  triggerTxId: Joi.string().required(),
});

export const validateGet = async (
  request: NextRequest,
  context: { params: Promise<GetEventGuardsStatusParams> },
) => {
  return ParamsSchema.validate(
    Object.assign({}, await context.params, Object.fromEntries(request.nextUrl.searchParams)),
  );
};
