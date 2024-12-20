import { NextRequest } from 'next/server';

import Joi from 'joi';

interface GETQueryParams {
  offset: number;
  limit: number;
}
const getQueryParamsSchema = Joi.object<GETQueryParams>().keys({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(0).max(100).default(20),
});

/**
 * validate get requests
 * @param request
 */
export const validateGet = ({ nextUrl: { searchParams } }: NextRequest) => {
  return getQueryParamsSchema.validate(Object.fromEntries(searchParams));
};
