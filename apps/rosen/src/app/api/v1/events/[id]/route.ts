import { NextRequest } from 'next/server';

import { getEventById } from '@/backend/events';

import { withValidation } from '../../withValidation';
import { validateGet } from './validations';

const handler = withValidation(validateGet, (value) => getEventById(value.id));

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;

  return handler(request, { params });
}
