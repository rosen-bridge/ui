import {
  PublicStatusActions,
  guardStatusChangedToDTO,
} from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { GetGuardStatusTimelineParams, validator } from './validator';

const handler = async (params: GetGuardStatusTimelineParams) => {
  return (
    await PublicStatusActions.getGuardStatusTimeline(params.id, params.guardPks)
  ).map(guardStatusChangedToDTO);
};

export const POST = withValidation(validator, handler);
