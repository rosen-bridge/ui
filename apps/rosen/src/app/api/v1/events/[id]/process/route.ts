import { validateGet } from '@/app/api/v1/events/[id]/validations';
import { withValidation } from '@/app/api/v1/withValidation';
import { getEventProcess } from '@/backend/events/repository';

export const GET = withValidation(validateGet, (value) =>
  getEventProcess(value.id),
);
