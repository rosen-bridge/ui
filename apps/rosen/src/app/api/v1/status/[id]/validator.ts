import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetAggregatedStatusTimelineRouteParam {
  id: string;
}

const ParamsSchema = Joi.object<GetAggregatedStatusTimelineRouteParam>().keys({
  id: Joi.string().length(64).required(),
});

export const validator = async (
  _: NextRequest,
  context?: { params: GetAggregatedStatusTimelineRouteParam },
) => {
  return ParamsSchema.validate({
    id: context?.params.id,
  });
};
