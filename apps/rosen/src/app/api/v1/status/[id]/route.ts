import { aggregatedStatusChangedToDTO } from '@/actions';
import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { GetAggregatedStatusTimelineRouteParam, validator } from './validator';

PublicStatusAction.init(dataSource);

const handler = async (params: GetAggregatedStatusTimelineRouteParam) => {
  return (
    await PublicStatusAction.getInstance().getAggregatedStatusTimeline(
      params.id,
      params.skip,
      params.take,
    )
  ).map(aggregatedStatusChangedToDTO);
};

export const GET = withValidation(validator, handler);
