import { validateGet } from '@/app/api/v1/events/[id]/validations';
import { withValidation } from '@/app/api/v1/withValidation';
import { getEventProcessService } from '@/backend/events';

export const GET = withValidation(validateGet, (value) =>
  getEventProcessService(value.id),
);
