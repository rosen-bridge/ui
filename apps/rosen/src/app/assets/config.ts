import { Filter, OPERATOR_IS } from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const getFilters = (): Filter[] => [
  {
    name: 'chain',
    label: 'Network',
    unique: true,
    operators: [OPERATOR_IS],
    input: () => ({
      type: 'select',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    }),
  },
];

export const sorts = [
  { label: 'Name', value: 'name' },
  { label: 'Network', value: 'chain' },
  { label: 'Bridged', value: 'bridged' },
];
