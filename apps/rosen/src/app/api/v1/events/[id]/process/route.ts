import { getEventProcess } from '@/backend/events';

import { withValidation } from '../../../withValidation';
import { validateGet } from '../validations';

export const GET = withValidation(validateGet, (value) =>
  getEventProcess(value.id),
);
