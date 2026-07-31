import { NextRequest } from 'next/server';

import { FilterParser } from '@rosen-bridge/query-params';
import { NETWORKS_KEYS } from '@rosen-ui/constants';

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
      max: 1000,
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

/**
 * validate get requests
 * @param request
 */
export const validateGet = async (request: NextRequest) => {
  return filterParser.parse(request.url);
};
