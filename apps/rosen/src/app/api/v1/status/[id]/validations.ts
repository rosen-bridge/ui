import { NextRequest } from 'next/server';

import Joi from 'joi';

export interface GetAggregatedStatusTimelineRouteParam {
  id: string;
  offset: number;
  limit: number;
}

const ParamsSchema = Joi.object<GetAggregatedStatusTimelineRouteParam>().keys({
  id: Joi.string().length(64).required(),
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(10).max(100).default(10),
});

export const validator = async (
  request: NextRequest,
  context?: { params: GetAggregatedStatusTimelineRouteParam },
) => {
  return ParamsSchema.validate(
    Object.assign(Object.fromEntries(request.nextUrl.searchParams), {
      id: context?.params.id,
    }),
  );
};
