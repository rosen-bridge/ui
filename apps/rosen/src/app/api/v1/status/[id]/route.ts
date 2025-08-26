import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { aggregatedStatusChangedToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import {
  GetAggregatedStatusTimelineRouteParam,
  validator,
} from './validations';

PublicStatusAction.init(dataSource);

const handler = async (params: GetAggregatedStatusTimelineRouteParam) => {
  const { total, items } =
    await PublicStatusAction.getInstance().getAggregatedStatusTimeline(
      params.id,
      params.offset,
      params.limit,
    );

  return {
    items: items.map(aggregatedStatusChangedToDTO),
    total,
  };
};

export const GET = withValidation(validator, handler);
