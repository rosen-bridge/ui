import {
  Filter,
  OPERATOR_CONTAINS,
  OPERATORS_EQUALITY,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const filters: Filter[] = [
  {
    name: 'chain',
    label: 'Network',
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
    name: 'id',
    label: 'Token Id',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'name',
    label: 'Token Name',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
];

export const sorts = [
  { label: 'Name', value: 'name' },
  { label: 'Network', value: 'chain' },
];
