import {
  createFilterParser,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { NextRequest } from 'next/server';

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
    ]
  },
  pagination: {
    enable: true
  },
  sorts: {
    enable: true,
    items: [
      {
        key: 'bridged'
      },
      {
        key: 'chain'
      },
      {
        key: 'name',
      }
    ]
  }
});
 
/**
 * validate get requests
 * @param request
 */
export const validateGet = async (request: NextRequest): any => {
  try {
    const value = parser(request.url);
    return { value }
  } catch (error) {
    return { error }
  }
};
