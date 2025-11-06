import {
  OPERATORS_EQUALITY,
  Filter,
  OPERATOR_CONTAINS,
} from '@rosen-bridge/ui-kit';

import { REQUEST_STATUS, REQUEST_TYPE } from './page';

export const getFilters = (): Filter[] => [
  {
    name: 'requestId',
    label: 'Request Id',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'eventId',
    label: 'Event Id',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'type',
    label: 'Type',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: {
      type: 'select',
      options: [
        { label: REQUEST_TYPE.INCOMING, value: 'INCOMING' },
        { label: REQUEST_TYPE.OUTGOING, value: 'OUTGOING' },
      ],
    },
  },
  {
    name: 'status',
    label: 'Status',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: {
      type: 'select',
      options: [{ label: REQUEST_STATUS.ACCEPTED, value: 'ACCEPTED' }],
    },
  },
  {
    name: 'sender',
    label: 'Sender',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
];

export const sorts = [
  { label: 'Time', value: 'timestamp' },
  { label: 'Sender', value: 'sender' },
];
