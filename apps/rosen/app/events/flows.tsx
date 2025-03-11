import { Flow, OPERATORS_EQUALITY } from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const flows: Flow[] = [
  {
    name: 'from-chain',
    label: 'From Chain',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator == 'is' ? 'select' : 'multiple',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    }),
  },
  {
    name: 'to-chain',
    label: 'To Chain',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator == 'is' ? 'select' : 'multiple',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    }),
  },
  {
    name: 'token',
    label: 'Token',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator == 'is' ? 'select' : 'multiple',
      options: [],
    }),
  },
  {
    name: 'status',
    label: 'Status',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator == 'is' ? 'select' : 'multiple',
      options: [
        {
          label: 'Processing',
          value: 'processing',
        },
        {
          label: 'Done',
          value: 'done',
        },
      ],
    }),
  },
  {
    name: 'initial-time',
    label: 'Initial Time',
    unique: true,
    operators: [
      { label: 'Before', value: 'before' },
      { label: 'After', value: 'after' },
    ],
    input: {
      type: 'select',
      options: [
        {
          label: '1 Day',
          value: '1',
        },
        {
          label: '2 Day',
          value: '2',
        },
        {
          label: '5 Days',
          value: '5',
        },
        {
          label: '1 Week',
          value: '7',
        },
        {
          label: '2 Week',
          value: '14',
        },
        {
          label: '3 Week',
          value: '21',
        },
        {
          label: '1 Month',
          value: '30',
        },
        {
          label: '2 Months',
          value: '60',
        },
      ],
    },
  },
];
