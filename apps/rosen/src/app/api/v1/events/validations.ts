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
        key: 'sourceChainTokenId',
        type: 'stringArray',
        operators: ['excludes', 'includes'],
      },
      {
        key: 'eventId',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'fromChain',
        type: 'stringArray',
        operators: ['excludes', 'includes'],
        values: NETWORKS_KEYS,
      },
      {
        key: 'toChain',
        type: 'stringArray',
        operators: ['excludes', 'includes'],
        values: NETWORKS_KEYS,
      },
      {
        key: 'fromAddress',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'toAddress',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'amount',
        type: 'number',
        operators: ['lessThanOrEqual', 'greaterThanOrEqual'],
      },
      {
        key: 'bridgeFee',
        type: 'number',
        operators: ['lessThanOrEqual', 'greaterThanOrEqual'],
      },
      {
        key: 'networkFee',
        type: 'number',
        operators: ['lessThanOrEqual', 'greaterThanOrEqual'],
      },
      {
        key: 'status',
        type: 'string',
        operators: ['equal'],
        values: ['successful', 'processing', 'fraud']
      },
      {
        key: 'sourceTxId',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'paymentTxId',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'spendTxId',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'height',
        type: 'number',
        operators: ['lessThanOrEqual', 'greaterThanOrEqual'],
      },
      {
        key: 'WIDsCount',
        type: 'number',
        operators: ['lessThanOrEqual', 'greaterThanOrEqual'],
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
        key: 'timestamp'
      },
      {
        key: 'WIDsCount'
      },
      {
        key: 'height',
      },
      {
        key: 'amount',
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
