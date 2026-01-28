import { NextRequest } from 'next/server';

import { withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { guardStatusChangedToDTO } from '@/backend/status';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { GetGuardStatusTimelineParams, validator } from './validations';

const handler = async (params: GetGuardStatusTimelineParams) => {
  PublicStatusAction.init(dataSource);

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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const body = await request.json();

  const { id } = await context.params;

  const params = {
    id,
    guardPks: body.guardPks,
    offset: body.offset,
    limit: body.limit,
  };

  return withValidation(validator, handler)(request, { params });
}
