import { NextRequest } from 'next/server';

import {
  extractFiltersFromSearchParams,
  filtersSchema,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';

/**
 * validate get requests
 * @param request
 */
export const validateGet = ({ nextUrl: { searchParams } }: NextRequest) => {
  return filtersSchema.validate(extractFiltersFromSearchParams(searchParams));
};
