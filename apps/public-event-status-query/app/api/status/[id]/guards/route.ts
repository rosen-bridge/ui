import { guardStatusChangedToDTO } from '@rosen-bridge/public-event-status-logic';

import { EventStatusActions } from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { Params, validator } from './validator';

async function handler(params: Params) {
  return (
    await EventStatusActions.getGuardStatusTimeline(params.id, params.guardPks)
  ).map(guardStatusChangedToDTO);
}

export const POST = withValidation(validator, handler);
