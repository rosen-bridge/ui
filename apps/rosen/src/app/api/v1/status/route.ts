import { NextRequest } from 'next/server';

import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { AggregatedStatusDTO, aggregatedStatusToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { validator, GetAggregatedStatusesRequestBody } from './validations';

type GetManyStatusResponse = Record<string, AggregatedStatusDTO>;

const handler = async (params: GetAggregatedStatusesRequestBody) => {
  PublicStatusAction.init(dataSource);

  const records = await PublicStatusAction.getInstance().getAggregatedStatuses(
    params.eventIds,
  );
  return records.reduce((dict, record) => {
    dict[record.eventId] = aggregatedStatusToDTO(record);
    return dict;
  }, {} as GetManyStatusResponse);
};

// type RouteContext = {
//   params: Promise<GetAggregatedStatusesRequestBody>;
// };

export async function POST(
  request: NextRequest,
  // context: RouteContext,
) {
  // const params = await context.params;

  return withValidation(validator, handler)(request);
}
