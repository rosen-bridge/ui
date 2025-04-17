import {
  PublicStatusActions,
  AggregatedStatusDTO,
  aggregatedStatusToDTO,
} from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { validator, GetAggregatedStatusesRequestBody } from './validator';

type GetManyStatusResponse = Record<string, AggregatedStatusDTO>;

const handler = async (params: GetAggregatedStatusesRequestBody) => {
  const records = await PublicStatusActions.getAggregatedStatuses(
    params.eventIds,
  );
  return records.reduce((dict, record) => {
    dict[record.eventId] = aggregatedStatusToDTO(record);
    return dict;
  }, {} as GetManyStatusResponse);
};

export const POST = withValidation(validator, handler);
