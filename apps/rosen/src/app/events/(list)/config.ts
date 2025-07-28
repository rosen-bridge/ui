import { TokenMap } from '@rosen-bridge/tokens';
import {
  OPERATORS_COMPARATIVE,
  OPERATORS_EQUALITY,
  Filter,
  OPERATOR_CONTAINS,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const getFilters = (tokenMap: TokenMap): Filter[] => [
  {
    name: 'sourceChainTokenId',
    label: 'Token',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: (context) => ({
      type: context.operator.endsWith('one-of') ? 'multiple' : 'select',
      options: tokenMap
        .getConfig()
        .map((item) => Object.values(item))
        .flat()
        .filter((item) => item.residency == 'native')
        .map((item) => ({
          label: item.name,
          value: item.tokenId,
        })),
    }),
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
    name: 'fromAddress',
    label: 'From Address',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'toAddress',
    label: 'To Address',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'amount',
    label: 'Amount',
    unique: false,
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'bridgeFee',
    label: 'Bridge Fee',
    unique: false,
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'networkFee',
    label: 'Network Fee',
    unique: false,
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'status',
    label: 'Status',
    unique: true,
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
    name: 'sourceTxId',
    label: 'Source Tx ID',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'paymentTxId',
    label: 'Payment Tx ID',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'spendTxId',
    label: 'Reward Tx ID',
    unique: true,
    operators: [OPERATOR_CONTAINS],
    input: {
      type: 'text',
    },
  },
  {
    name: 'height',
    label: 'Height',
    unique: false,
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
  {
    name: 'WIDsCount',
    label: 'Reports',
    unique: false,
    operators: OPERATORS_COMPARATIVE,
    input: {
      type: 'number',
    },
  },
];

export const sorts = [
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Reports', value: 'WIDsCount' },
  { label: 'Height', value: 'height' },
  { label: 'Amount', value: 'amount' },
];
