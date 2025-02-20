import {
  StatusChangedDTO,
  statusChangedToDTO,
} from '@rosen-bridge/public-event-status-logic';

import { EventStatusActions } from '@/_backend/actions';
import { withValidation } from '@/api/withValidation';

import { validator, Params } from './validator';

type GetManyStatusResponse = Record<string, StatusChangedDTO>;

async function handler(params: Params) {
  const records = await EventStatusActions.getStatusesById(params.eventIds);
  return records.reduce((dict, record) => {
    dict[record.eventId] = statusChangedToDTO(record);
    return dict;
  }, {} as GetManyStatusResponse);
}

export const POST = withValidation(validator, handler);
