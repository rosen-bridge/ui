import { getEventStatusById } from '@/backend/events';

import { withValidation } from '../../../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getEventStatusById(value.id, value.guardPublicKey),
);
