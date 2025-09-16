import { withValidation } from '@/app/api/v1/withValidation';
import { getEventById } from '@/backend/events';

import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getEventById(value.id),
);
