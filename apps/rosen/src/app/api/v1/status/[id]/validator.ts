import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetAggregatedStatusTimelineRouteParam {
  id: string;
  skip: number;
  take: number;
}

const ParamsSchema = Joi.object<GetAggregatedStatusTimelineRouteParam>().keys({
  id: Joi.string().length(64).required(),
  skip: Joi.number().integer().min(0),
  take: Joi.number().integer().min(10).max(100),
});

export const validator = async (
  request: NextRequest,
  context?: { params: GetAggregatedStatusTimelineRouteParam },
) => {
  const { searchParams } = new URL(request.url);

  return ParamsSchema.validate({
    id: context?.params.id,
    skip: searchParams.get('skip') ?? 0,
    take: searchParams.get('take') ?? 20,
  });
};
