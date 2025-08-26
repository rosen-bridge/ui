import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { guardStatusChangedToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { GetGuardStatusTimelineParams, validator } from './validations';

PublicStatusAction.init(dataSource);

const handler = async (params: GetGuardStatusTimelineParams) => {
  const { total, items } =
    await PublicStatusAction.getInstance().getGuardStatusTimeline(
      params.id,
      params.guardPks,
      params.offset,
      params.limit,
    );

  return {
    items: items.map(guardStatusChangedToDTO),
    total,
  };
};

export const POST = withValidation(validator, handler);
