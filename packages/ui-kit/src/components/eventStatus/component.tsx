import { Chip, type ChipProps, type IconProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { STATUS_MAP } from './constants';

export interface EventStatusOverrides {}

export type EventStatusMeta = {
  icon: IconProps['name'];
  label: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
};

export type EventStatusOwnProps = {
  fallback?: EventStatusMeta;
  value?: keyof typeof STATUS_MAP | EventStatusMeta;
};

export type EventStatusBaseProps = ElementBaseProps<typeof Chip, EventStatusOwnProps>;

export type EventStatusProps = OverridableType<EventStatusBaseProps, EventStatusOverrides, never>;

export const EventStatus = (props: EventStatusProps) => {
  const { fallback, value, ...rest } = useConfig('EventStatus', props);

  const { icon, label, severity } = Object.assign(
    {},
    {
      icon: 'ExclamationCircle',
      label: 'Unknown',
    },
    fallback,
    typeof value === 'string' ? STATUS_MAP?.[value] : value,
  );

  const color: ChipProps['color'] = severity || 'neutral';

  return <Chip color={color} icon={icon} label={label} {...rest} />;
};

EventStatus.displayName = 'EventStatus';
