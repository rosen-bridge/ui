import { statusChangedToDTO } from '@rosen-bridge/public-event-status-logic';

import { EventStatusActions } from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { Params, validator } from './validator';

async function handler(params: Params) {
  return (await EventStatusActions.getStatusTimeline(params.id)).map(
    statusChangedToDTO,
  );
}

export const GET = withValidation(validator, handler);
