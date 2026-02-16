import { NextRequest } from 'next/server';

import Joi from 'joi';

interface GETPositionalParams {
  id: string;
}

const getQueryParamsSchema = Joi.object<GETPositionalParams>().keys({
  id: Joi.string().required(),
});

/**
 * validate get requests
 * @param request
 */
export const validateGet = async (
  _: NextRequest,
  context: { params: Promise<GETPositionalParams> },
) => {
  return getQueryParamsSchema.validate(await context.params);
};
