import {
  PublicStatusActions,
  aggregatedStatusChangedToDTO,
} from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { Params, validator } from './validator';

async function handler(params: Params) {
  return (await PublicStatusActions.getAggregatedStatusTimeline(params.id)).map(
    aggregatedStatusChangedToDTO,
  );
}

export const GET = withValidation(validator, handler);
