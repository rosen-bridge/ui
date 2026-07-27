import { getEventStatusByTriggerTxId } from '@/backend/events';

import { withValidation } from '../../../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getEventStatusByTriggerTxId(
    value.id,
    value.triggerTxId,
    value.guardPublicKey,
  ),
);
