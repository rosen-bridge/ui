import { NextRequest } from 'next/server';

import { getHeightNetworks } from '@/backend/heightNetworks/services';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

const handler = withValidation(validateGet, getHeightNetworks);

export async function GET(request: NextRequest) {
  return handler(request);
}
