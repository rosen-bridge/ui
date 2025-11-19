import { NextRequest } from 'next/server';

import {
  FiltersSchema,
  searchParamsToFilters,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';

/**
 * validate get requests
 * @param request
 */
export const validateGet = async ({
  nextUrl: { searchParams },
}: NextRequest) => {
  return FiltersSchema.validate(searchParamsToFilters(searchParams));
};
