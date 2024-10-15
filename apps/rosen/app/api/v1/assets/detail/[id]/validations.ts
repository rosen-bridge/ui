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
export const validateGet = (
  _: NextRequest,
  context?: { params: GETPositionalParams },
) => {
  return getQueryParamsSchema.validate(context?.params);
};
