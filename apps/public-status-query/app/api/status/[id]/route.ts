import {
  PublicStatusActions,
  aggregatedStatusChangedToDTO,
} from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { GetAggregatedStatusTimelineRouteParam, validator } from './validator';

async function handler(params: GetAggregatedStatusTimelineRouteParam) {
  return (await PublicStatusActions.getAggregatedStatusTimeline(params.id)).map(
    aggregatedStatusChangedToDTO,
  );
}

export const GET = withValidation(validator, handler);
