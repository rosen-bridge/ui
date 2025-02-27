import {
  EventStatusActions,
  overallStatusChangedToDTO,
} from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { Params, validator } from './validator';

async function handler(params: Params) {
  return (await EventStatusActions.getStatusTimeline(params.id)).map(
    overallStatusChangedToDTO,
  );
}

export const GET = withValidation(validator, handler);
