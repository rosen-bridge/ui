import { NextRequest } from 'next/server';

import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { aggregatedStatusChangedToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import {
  GetAggregatedStatusTimelineRouteParam,
  validator,
} from './validations';

const handler = async (params: GetAggregatedStatusTimelineRouteParam) => {
  PublicStatusAction.init(dataSource);

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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;

  return withValidation(validator, handler)(request, { params });
}
