import {
  Flow,
  OPERATORS_COMPARATIVE,
  OPERATORS_EQUALITY,
  OPERATOR_IS,
  OPERATORS_STRING,
  Sort,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const flows: Flow[] = [
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
    name: 'fromChain',
    label: 'From Chain',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    }),
  },
  {
    name: 'toChain',
    label: 'To Chain',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    }),
  },
  {
    name: 'height',
    label: 'Height',
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  // {
  //   name: 'token',
  //   label: 'Token',
  //   unique: true,
  //   operators: OPERATORS_EQUALITY,
  //   input: (context) => ({
  //     type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
  //     options: [],
  //   }),
  // },
  // {
  //   name: 'amount',
  //   label: 'Amount',
  //   operators: OPERATORS_COMPARATIVE,
  //   input: {
  //     type: 'text',
  //   },
  // },
  // {
  //   name: 'status',
  //   label: 'Status',
  //   unique: true,
  //   operators: OPERATORS_EQUALITY,
  //   input: (context) => ({
  //     type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
  //     options: [
  //       {
  //         label: 'Fraud',
  //         value: 'fraud',
  //       },
  //       {
  //         label: 'Processing',
  //         value: null,
  //       },
  //       {
  //         label: 'Done',
  //         value: 'successful',
  //       },
  //     ],
  //   }),
  // },
  {
    name: 'in',
    label: 'Search whithin',
    operators: [OPERATOR_IS],
    input: {
      type: 'select',
      options: [
        {
          label: 'Event Id',
          value: 'requestId',
        },
        {
          label: 'Lock TX Id',
          value: 'sourceTxId',
        },
        {
          label: 'From Address',
          value: 'fromAddress',
        },
        {
          label: 'To Address',
          value: 'toAddress',
        },
      ],
    },
  },
  {
    name: 'search',
    label: 'Search for this text',
    operators: [OPERATOR_IS],
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

export const sortDefault: Sort = { key: 'timestamp', order: 'DESC' };
