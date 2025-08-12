'use client';

import { Chip } from '@rosen-bridge/ui-kit';

const progressStatusMap = {
  pendingCommittment: {
    label: 'Pending Committment',
    color: 'info',
    icon: 'HourGlass',
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
    icon: 'HourGlass',
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
    icon: 'HourGlass',
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

type ProgressStatusKey = keyof typeof progressStatusMap;

export const ProgressStatus = ({ state }: { state: ProgressStatusKey }) => {
  const status = progressStatusMap[state];
  if (!status) return null;

  return <Chip label={status.label} color={status.color} icon={status.icon} />;
};
