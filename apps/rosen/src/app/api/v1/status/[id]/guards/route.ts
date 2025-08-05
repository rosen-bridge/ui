import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { guardStatusChangedToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { GetGuardStatusTimelineParams, validator } from './validator';

PublicStatusAction.init(dataSource);

const handler = async (params: GetGuardStatusTimelineParams) => {
  return (
    await PublicStatusAction.getInstance().getGuardStatusTimeline(
      params.id,
      params.guardPks,
    )
  ).map(guardStatusChangedToDTO);
};

export const POST = withValidation(validator, handler);
