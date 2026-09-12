import { getEventGuardsStatus } from '@/backend/events';

import { withValidation } from '../../../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getEventGuardsStatus(value.id, value.triggerTxId),
);
