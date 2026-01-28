import { NextRequest } from 'next/server';

import { getAllAssets } from '@/backend/assets';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

const handler = withValidation(validateGet, getAllAssets);

export async function GET(request: NextRequest):Promise<Response> {
  return handler(request);
}
