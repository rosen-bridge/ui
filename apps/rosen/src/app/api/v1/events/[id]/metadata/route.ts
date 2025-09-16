import { validateGet } from '@/app/api/v1/events/[id]/validations';
import { withValidation } from '@/app/api/v1/withValidation';
import { getEventMetadataService } from '@/backend/events';

export const GET = withValidation(validateGet, (value) =>
  getEventMetadataService(value.id),
);
