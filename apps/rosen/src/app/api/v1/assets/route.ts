import { FilterParser } from '@rosen-bridge/query-params';
import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { defineRoute } from '@/app/api/defineRoute';
import { getAllAssets } from '@/backend/assets';

const filterParser = new FilterParser({
  fields: {
    enable: true,
    items: [
      {
        key: 'chain',
        type: 'string',
        values: NETWORKS_KEYS,
      },
      {
        key: 'name',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'id',
        type: 'string',
        operators: ['contains'],
      },
    ],
  },
  pagination: {
    enable: true,
    limit: {
      min: 1,
      max: 100,
      default: 10,
    },
    offset: {
      min: 0,
      max: Infinity,
      default: 0,
    },
  },
  sorts: {
    enable: true,
    items: [
      {
        key: 'name',
        defaultOrder: 'ASC',
      },
      {
        key: 'chain',
      },
      {
        key: 'bridged',
      },
    ],
  },
});

export const GET = defineRoute({
  schema: {
    query: ({ request }) => filterParser.parse(request.url),
  },
  handler: ({ input }) => getAllAssets(input.query),
});
