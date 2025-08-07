import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { AggregatedStatusDTO, aggregatedStatusToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { validator, GetAggregatedStatusesRequestBody } from './validator';

PublicStatusAction.init(dataSource);

type GetManyStatusResponse = Record<string, AggregatedStatusDTO>;

const handler = async (params: GetAggregatedStatusesRequestBody) => {
  const records = await PublicStatusAction.getInstance().getAggregatedStatuses(
    params.eventIds,
  );
  return records.reduce((dict, record) => {
    dict[record.eventId] = aggregatedStatusToDTO(record);
    return dict;
  }, {} as GetManyStatusResponse);
};

export const POST = withValidation(validator, handler);
