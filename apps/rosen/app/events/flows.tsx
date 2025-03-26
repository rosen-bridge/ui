import { Flow, OPERATORS_EQUALITY, OPERATOR_IS } from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const flows: Flow[] = [
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
  {
    name: 'status',
    label: 'Status',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
      options: [
        {
          label: 'Fraud',
          value: 'fraud',
        },
        {
          label: 'Processing',
          value: null,
        },
        {
          label: 'Done',
          value: 'successful',
        },
      ],
    }),
  },
  {
    name: 'search',
    label: 'Search for this text',
    operators: [OPERATOR_IS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'in',
    label: 'Search whithin',
    operators: [OPERATOR_IS],
    input: {
      type: 'select',
      options: [
        {
          label: 'From Address',
          value: 'fromAddress',
        },
        {
          label: 'To Address',
          value: 'toAddress',
        },
        {
          label: 'Event Id',
          value: 'requestId',
        },
        {
          label: 'Lock TX Id',
          value: 'sourceTxId',
        },
      ],
    },
  },
];
