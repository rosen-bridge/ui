import {
  OPERATORS_COMPARATIVE,
  OPERATORS_EQUALITY,
  OPERATOR_IS,
  OPERATORS_STRING,
  Filter,
  OPERATOR_GREATER_THAN_OR_EQUAL,
  OPERATOR_LESS_THAN_OR_EQUAL,
} from '@rosen-bridge/ui-kit';


export const filters: Filter[] = [
  {
    name: 'requestId',
    label: 'Event Id',
    unique: true,
    operators: OPERATORS_STRING,
    input: {
      type: 'text',
    },
  },
  {
    name: 'fromAddress',
    label: 'From Address',
    unique: true,
    operators: OPERATORS_STRING,
    input: {
      type: 'text',
    },
  },
  {
    name: 'toAddress',
    label: 'To Address',
    unique: true,
    operators: OPERATORS_STRING,
    input: {
      type: 'text',
    },
  },
  {
    name: 'height',
    label: 'Height',
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'status',
    label: 'Status',
    operators: OPERATORS_EQUALITY,
    input: {
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Processing', value: 'processing' },
      ],
    },
  },
  {
    name: 'amount',
    label: 'Amount',
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'reports',
    label: 'Reports',
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'source',
    label: 'Source',
    unique: true,
    operators: OPERATORS_STRING,
    input: {
      type: 'text',
    },
  },
  {
    name: 'payment',
    label: 'Payment',
    unique: true,
    operators: OPERATORS_STRING,
    input: {
      type: 'text',
    },
  },
  {
    name: 'reward',
    label: 'Reward',
    unique: true,
    operators: OPERATORS_STRING,
    input: {
      type: 'text',
    },
  },
];

export const sorts = [
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'From Chain', value: 'fromChain' },
  { label: 'To Chain', value: 'toChain' },
];
