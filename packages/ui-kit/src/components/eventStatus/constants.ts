import type { EventStatusMeta } from './component';

export const STATUS_MAP: Record<string, EventStatusMeta> = {
  COMPLETED: {
    label: 'Completed',
    severity: 'success',
    icon: 'CheckCircle',
  },
  CREATED: {
    label: 'Created',
    severity: 'info',
    icon: 'Edit',
  },
  FRAUD: {
    label: 'Fraud',
    severity: 'error',
    icon: 'Ban',
  },
  MULTIPLE_FLOWS: {
    label: 'Multiple Flows',
    severity: 'warning',
    icon: 'CodeBranch',
  },
  PAID: {
    label: 'Paid',
    severity: 'info',
    icon: 'Coins',
  },
  PAYMENT_APPROVED: {
    label: 'Payment Approved',
    severity: 'info',
    icon: 'Coins',
  },
  PAYMENT_SENT: {
    label: 'Payment Sent',
    severity: 'info',
    icon: 'Coins',
  },
  PAYMENT_SIGNED: {
    label: 'Payment Signed',
    severity: 'info',
    icon: 'Coins',
  },
  PAYMENT_SIGNING: {
    label: 'Signing Payment',
    severity: 'info',
    icon: 'Coins',
  },
  PAYMENT_STALLED: {
    label: 'Payment Stalled',
    severity: 'warning',
    icon: 'ExclamationCircle',
  },
  REACHED_LIMIT: {
    label: 'Reached Limit',
    severity: 'error',
    icon: 'ExclamationOctagon',
  },
  REJECTED: {
    label: 'Rejected',
    severity: 'error',
    icon: 'CloseCircle',
  },
  REWARD_APPROVED: {
    label: 'Reward Approved',
    severity: 'info',
    icon: 'Gift',
  },
  REWARD_SENT: {
    label: 'Reward Sent',
    severity: 'info',
    icon: 'Gift',
  },
  REWARD_SIGNED: {
    label: 'Reward Signed',
    severity: 'info',
    icon: 'Gift',
  },
  REWARD_SIGNING: {
    label: 'Signing Reward',
    severity: 'info',
    icon: 'Gift',
  },
  REWARD_STALLED: {
    label: 'Reward Stalled',
    severity: 'warning',
    icon: 'ExclamationCircle',
  },
  TIMEOUT: {
    label: 'Timeout',
    severity: undefined,
    icon: 'ClockThree',
  },
  TRIGGERED: {
    label: 'Triggered',
    severity: 'info',
    icon: 'SignOutAlt',
  },
  UNKNOWN: {
    label: 'Unknown',
    severity: undefined,
    icon: 'ExclamationCircle',
  },

  // should remove
  processing: {
    label: 'Processing',
    severity: 'info',
    icon: 'Hourglass',
  },
} as const;
