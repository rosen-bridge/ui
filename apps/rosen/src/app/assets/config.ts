import { TokenMap } from '@rosen-bridge/tokens';
import {
  Filter,
  OPERATOR_CONTAINS,
  OPERATOR_IS,
  OPERATORS_COMPARATIVE,
  OPERATORS_EQUALITY,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const getFilters = (tokenMap: TokenMap): Filter[] => [
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
  {
    name: 'name',
    label: 'Name',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'id',
    label: 'Id',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  // {
  //   name: 'bridgedTokenId',
  //   label: 'Token',
  //   unique: true,
  //   operators: OPERATORS_EQUALITY,
  //   input: (context) => ({
  //     type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
  //     options: tokenMap
  //       .getConfig()
  //       .map((item) => Object.values(item))
  //       .flat()
  //       .filter((item) => item.residency == 'native')
  //       .map((item) => ({
  //         label: item.name,
  //         value: item.tokenId,
  //       })),
  //   }),
  // },
];

export const sorts = [
  { label: 'Name', value: 'name' },
  { label: 'Network', value: 'chain' },
  { label: 'Bridged', value: 'bridged' },
];
