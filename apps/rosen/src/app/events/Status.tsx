'use client';

import { Chip } from '@rosen-bridge/ui-kit';

const STATES = {
  processing: {
    label: 'Processing',
    color: 'info',
    icon: 'Hourglass',
  },
  pendingCommittment: {
    label: 'Pending Committment',
    color: 'info',
    icon: 'Hourglass',
  },
  committed: {
    label: 'Committed',
    color: 'info',
    icon: 'ThumbsUp',
  },
  triggered: {
    label: 'Triggered',
    color: 'info',
    icon: 'SignOutAlt',
  },
  scanned: {
    label: 'Scanned',
    color: 'info',
    icon: 'Eye',
  },
  pendingPayment: {
    label: 'Pending Payment',
    color: 'info',
    icon: 'Hourglass',
  },
  inPaymentApproved: {
    label: 'In Payment / Approved',
    color: 'info',
    icon: 'Coins',
  },
  inPaymentInSign: {
    label: 'In Payment / In Sign',
    color: 'info',
    icon: 'Coins',
  },
  inPaymentSignFailed: {
    label: 'In Payment / Sign Failed',
    color: 'warning',
    icon: 'Coins',
  },
  inPaymentSigned: {
    label: 'In Payment / Sign Failed',
    color: 'info',
    icon: 'Coins',
  },
  inPaymentSent: {
    label: 'In Payment / Sent',
    color: 'info',
    icon: 'Coins',
  },
  pendingReward: {
    label: 'Pending Reward',
    color: 'info',
    icon: 'Hourglass',
  },
  inRewardApproved: {
    label: 'In Reward / Approved',
    color: 'info',
    icon: 'Gift',
  },
  inRewardInSign: {
    label: 'In Reward / In Sign',
    color: 'info',
    icon: 'Gift',
  },
  inRewardSignFailed: {
    label: 'In Reward / Sign Failed',
    color: 'warning',
    icon: 'Gift',
  },
  inRewardSigned: {
    label: 'In Reward / Signed',
    color: 'info',
    icon: 'Gift',
  },
  inRewardSent: {
    label: 'In Reward / Sent',
    color: 'info',
    icon: 'Gift',
  },
  completed: {
    label: 'Completed',
    color: 'success',
    icon: 'CheckCircle',
  },
  successful: {
    label: 'Successful',
    color: 'success',
    icon: 'CheckCircle',
  },
  timeout: {
    label: 'Timeout',
    color: 'neutral',
    icon: 'ClockThree',
  },
  rejected: {
    label: 'Rejected',
    color: 'error',
    icon: 'CloseCircle',
  },
  fraud: {
    label: 'Fraud',
    color: 'error',
    icon: 'Ban',
  },
} as const;

export type StatusProps = {
  loading?: boolean;
  value?: keyof typeof STATES;
};

export const Status = ({ loading, value }: StatusProps) => {
  if (loading) return <Chip loading />;

  const status = value && STATES[value];

  if (!status)
    return <Chip label="Unknown" color="neutral" icon="ExclamationCircle" />;

  return <Chip label={status.label} color={status.color} icon={status.icon} />;
};
