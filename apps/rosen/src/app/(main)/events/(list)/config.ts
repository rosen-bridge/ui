import type { TokenMap } from '@rosen-bridge/tokens';
import {
  type Filter,
  OPERATOR_CONTAINS,
  OPERATOR_IS,
  OPERATOR_NOT,
  OPERATORS_COMPARATIVE,
  OPERATORS_EQUALITY,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const getFilters = (tokenMap: TokenMap): Filter[] => [
  {
    name: 'originalTokenId',
    label: 'Token',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: {
      type: 'select',
      options: tokenMap
        .getConfig()
        .flatMap((item) => Object.values(item))
        .filter((item) => item.residency === 'native')
        .map((item) => ({
          label: item.name,
          value: item.tokenId,
        })),
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
    name: 'fromChain',
    label: 'From Chain',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: {
      type: 'select',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    },
  },
  {
    name: 'toChain',
    label: 'To Chain',
    unique: true,
    operators: OPERATORS_EQUALITY,
    input: {
      type: 'select',
      options: NETWORKS_KEYS.map((key) => ({
        label: NETWORKS[key].label,
        value: key,
      })),
    },
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
    operators: [OPERATOR_IS, OPERATOR_NOT],
    input: {
      type: 'select',
      options: [
        { label: 'Created', value: 'CREATED' },
        { label: 'Triggered', value: 'TRIGGERED' },
        { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
        { label: 'Payment Approved', value: 'PAYMENT_APPROVED' },
        { label: 'Signing Payment', value: 'PAYMENT_SIGNING' },
        { label: 'Payment Signed', value: 'PAYMENT_SIGNED' },
        { label: 'Payment Sent', value: 'PAYMENT_SENT' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Payment Aborted', value: 'PAYMENT_ABORTED' },
        { label: 'Payment Stalled', value: 'PAYMENT_STALLED' },
        { label: 'Reward Pending', value: 'REWARD_PENDING' },
        { label: 'Reward Approved', value: 'REWARD_APPROVED' },
        { label: 'Signing Reward', value: 'REWARD_SIGNING' },
        { label: 'Reward Signed', value: 'REWARD_SIGNED' },
        { label: 'Reward Sent', value: 'REWARD_SENT' },
        { label: 'Rewarded', value: 'REWARDED' },
        { label: 'Reward Aborted', value: 'REWARD_ABORTED' },
        { label: 'Reward Stalled', value: 'REWARD_STALLED' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Fraud', value: 'FRAUD' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Reached Limit', value: 'REACHED_LIMIT' },
        { label: 'Timeout', value: 'TIMEOUT' },
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
    name: 'reports',
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
  { label: 'Reports', value: 'reports' },
  { label: 'Height', value: 'height' },
  { label: 'Amount', value: 'amount' },
];
