import { NextRequest } from 'next/server';

import {
  filtersSchema,
  extractFiltersFromSearchParams,
} from '@/_utils/filters';

/**
 * validate get requests
 * @param request
 */
export const validateGet = ({ nextUrl: { searchParams } }: NextRequest) => {
  return filtersSchema.validate(extractFiltersFromSearchParams(searchParams));
};
