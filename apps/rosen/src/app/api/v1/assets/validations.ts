import { NextRequest } from 'next/server';

import { createFilterParser } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { NETWORKS_KEYS } from '@rosen-ui/constants';

const parser = createFilterParser({
  fields: {
    enable: true,
    items: [
      {
        key: 'chain',
        type: 'string',
        operators: ['equal'],
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
  },
  sorts: {
    enable: true,
    items: [
      {
        key: 'bridged',
      },
      {
        key: 'chain',
      },
      {
        key: 'name',
      },
    ],
  },
});

/**
 * validate get requests
 * @param request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateGet = async (request: NextRequest): Promise<any> => {
  try {
    const value = parser(request.url);
    return { value };
  } catch (error) {
    return { error };
  }
};
