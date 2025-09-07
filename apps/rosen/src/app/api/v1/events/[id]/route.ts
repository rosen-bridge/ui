import { withValidation } from '@/app/api/v1/withValidation';
import { getEventById } from '@/backend/events/repository';

import { validateGetEvent } from './validations';

export const GET = withValidation(validateGetEvent, (value) =>
  getEventById((value as { id: string }).id),
);
