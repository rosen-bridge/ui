import { NextRequest } from 'next/server';

import { getAsset } from '@/backend/assets';

import { withValidation } from '../../../withValidation';
import { validateGet } from './validations';

// const handler = withValidation(validateGet, (value) => getAsset(value.id));

type Ctx = {
  params: Promise<{ id: string }>;
};

const handler2 = (value: { id: string }) => {
  return getAsset(value.id);
};

export async function GET(
  request: NextRequest,
  context: Ctx,
) {
  const params = await context.params;

  return withValidation(validateGet,handler2)(request, { params });
}
