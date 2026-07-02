import type { EventStatusMeta } from './component';

export const STATUS_MAP: Record<string, EventStatusMeta> = {
  COMPLETED: {
    label: 'Completed',
    color: 'success',
    icon: 'CheckCircle',
  },
  CREATED: {
    label: 'Created',
    color: 'info',
    icon: 'Edit',
  },
  FRAUD: {
    label: 'Fraud',
    color: 'error',
    icon: 'Ban',
  },
  MULTIPLE_FLOWS: {
    label: 'Multiple Flows',
    color: 'warning',
    icon: 'CodeBranch',
  },
  PAID: {
    label: 'Paid',
    color: 'info',
    icon: 'Coins',
  },
  PAYMENT_APPROVED: {
    label: 'Payment Approved',
    color: 'info',
    icon: 'Coins',
  },
  PAYMENT_SENT: {
    label: 'Payment Sent',
    color: 'info',
    icon: 'Coins',
  },
  PAYMENT_SIGNED: {
    label: 'Payment Signed',
    color: 'info',
    icon: 'Coins',
  },
  PAYMENT_SIGNING: {
    label: 'Signing Payment',
    color: 'info',
    icon: 'Coins',
  },
  PAYMENT_STALLED: {
    label: 'Payment Stalled',
    color: 'warning',
    icon: 'ExclamationCircle',
  },
  REACHED_LIMIT: {
    label: 'Reached Limit',
    color: 'error',
    icon: 'ExclamationOctagon',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'error',
    icon: 'CloseCircle',
  },
  REWARD_APPROVED: {
    label: 'Reward Approved',
    color: 'info',
    icon: 'Gift',
  },
  REWARD_SENT: {
    label: 'Reward Sent',
    color: 'info',
    icon: 'Gift',
  },
  REWARD_SIGNED: {
    label: 'Reward Signed',
    color: 'info',
    icon: 'Gift',
  },
  REWARD_SIGNING: {
    label: 'Signing Reward',
    color: 'info',
    icon: 'Gift',
  },
  REWARD_STALLED: {
    label: 'Reward Stalled',
    color: 'warning',
    icon: 'ExclamationCircle',
  },
  TIMEOUT: {
    label: 'Timeout',
    color: 'neutral',
    icon: 'ClockThree',
  },
  TRIGGERED: {
    label: 'Triggered',
    color: 'info',
    icon: 'SignOutAlt',
  },
  UNKNOWN: {
    label: 'Unknown',
    color: 'neutral',
    icon: 'ExclamationCircle',
  },

  // should remove
  processing: {
    label: 'Processing',
    color: 'info',
    icon: 'Hourglass',
  },
  successful: {
    label: 'Successful',
    color: 'success',
    icon: 'CheckCircle',
  },
  fraud: {
    label: 'Fraud',
    color: 'error',
    icon: 'Ban',
  },
  multipleFlows: {
    label: 'Multiple Flows',
    color: 'warning',
    icon: 'CodeBranch',
  },
} as const;
