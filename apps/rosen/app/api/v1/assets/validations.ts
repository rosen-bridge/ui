import { NextRequest } from 'next/server';
import Joi from 'joi';
import { NETWORK_VALUES } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

interface GETQueryParams {
  offset: number;
  limit: number;
  id?: string;
  name?: string;
  chain?: Network;
}

const getQueryParamsSchema = Joi.object<GETQueryParams>().keys({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(0).max(100).default(20),
  id: Joi.string(),
  name: Joi.string(),
  chain: Joi.string().valid(...NETWORK_VALUES),
});

/**
 * validate get requests
 * @param request
 */
export const validateGet = ({ nextUrl: { searchParams } }: NextRequest) => {
  return getQueryParamsSchema.validate(Object.fromEntries(searchParams));
};
