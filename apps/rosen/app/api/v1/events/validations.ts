import { NextRequest } from 'next/server';

import {
  FiltersSchema,
  searchParamsToFilters,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';

/**
 * validate get requests
 * @param request
 */
export const validateGet = ({ nextUrl: { searchParams } }: NextRequest) => {
  return FiltersSchema.validate(searchParamsToFilters(searchParams));
};
