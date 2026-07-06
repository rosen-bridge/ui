import { Color, IconProps } from '@rosen-bridge/ui-kit';

import { RecentTransaction } from './types';

export const TYPE_MAP: Record<RecentTransaction['type'], string> = {
  payment: 'Payment',
  reward: 'Reward',
};

export const STATUS_MAP: Record<
  RecentTransaction['status'],
  { backgroundColor: Color; color: Color; icon: IconProps['name']; label: string }
> = {
  'completed': {
    backgroundColor: 'success-light',
    color: 'success-dark',
    icon: 'CheckCircle',
    label: 'Completed',
  },
  'in-sign': {
    backgroundColor: 'info-light',
    color: 'info-dark',
    icon: 'CheckCircle',
    label: 'In Sign',
  },
  'sign-failed': {
    backgroundColor: 'warning-light',
    color: 'warning-dark',
    icon: 'CheckCircle',
    label: 'Sign Failed',
  },
};
