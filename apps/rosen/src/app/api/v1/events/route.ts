import { NextRequest } from 'next/server';

import { Filters } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';

import { getEventsWithFullTokenData } from '@/backend/events';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

const handler = async (params: Filters) => {
  return getEventsWithFullTokenData(params);
};

export async function GET(request: NextRequest) {
  return withValidation(validateGet, handler)(request);
}
