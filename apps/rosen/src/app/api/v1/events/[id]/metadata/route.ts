import { getEventMetadata } from '@/backend/events';

import { withValidation } from '../../../withValidation';
import { validateGet } from '../validations';

export const GET = withValidation(validateGet, (value) =>
  getEventMetadata(value.id),
);
