import { FilterParser } from '@rosen-bridge/query-params';
import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { defineRoute } from '@/app/api/defineRoute';
import { getEventsWithFullTokenData } from '@/backend/events';

const filterParser = new FilterParser({
  fields: {
    enable: true,
    items: [
      {
        key: 'originalTokenId',
        type: 'string',
        operators: ['equal', 'notEqual'],
      },
      {
        key: 'eventId',
        type: 'string',
        operators: ['contains'],
      },
      {
        key: 'fromChain',
        type: 'string',
        operators: ['equal', 'notEqual'],
        values: NETWORKS_KEYS,
      },
      {
        key: 'toChain',
        type: 'string',
        operators: ['equal', 'notEqual'],
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
        operators: ['greaterThanOrEqual', 'lessThanOrEqual'],
      },
      {
        key: 'bridgeFee',
        type: 'number',
        operators: ['greaterThanOrEqual', 'lessThanOrEqual'],
      },
      {
        key: 'networkFee',
        type: 'number',
        operators: ['greaterThanOrEqual', 'lessThanOrEqual'],
      },
      {
        key: 'status',
        type: 'string',
        operators: ['equal', 'notEqual'],
        values: ['FRAUD', 'processing', 'COMPLETED'],
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
        operators: ['greaterThanOrEqual', 'lessThanOrEqual'],
      },
      {
        key: 'WIDsCount',
        type: 'number',
        operators: ['greaterThanOrEqual', 'lessThanOrEqual'],
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
        key: 'timestamp',
        defaultOrder: 'DESC',
      },
      {
        key: 'WIDsCount',
        defaultOrder: 'DESC',
      },
      {
        key: 'height',
        defaultOrder: 'DESC',
      },
      {
        key: 'amount',
        defaultOrder: 'DESC',
      },
    ],
  },
});

export const GET = defineRoute({
  schema: {
    query: ({ request }) => filterParser.parse(request.url),
  },
  handler: ({ input }) => getEventsWithFullTokenData(input.query),
});
