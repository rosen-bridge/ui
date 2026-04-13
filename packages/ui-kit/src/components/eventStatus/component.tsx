import { useMemo } from 'react';

import { Chip, ChipProps, IconProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import { STATUS_MAP } from './constants';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventStatusOverrides {}

export type EventStatusMeta = {
  label: string;
  color: ChipProps['color'];
  icon: IconProps['name'];
};

export type EventStatusOwnProps = {
  fallback?: EventStatusMeta;
  value?: keyof typeof STATUS_MAP;
};

export type EventStatusBaseProps = ElementBaseProps<
  typeof Chip,
  EventStatusOwnProps
>;

export type EventStatusProps = OverridableType<
  EventStatusBaseProps,
  EventStatusOverrides,
  never
>;

const DEFAULT_EVENT_STATUS: EventStatusMeta = {
  label: 'Unknown',
  color: 'neutral',
  icon: 'ExclamationCircle',
};

export const EventStatusBase = ({
  fallback,
  value,
  ...rest
}: EventStatusProps) => {
  const { color, icon, label } = useMemo(
    () =>
      Object.assign(
        {},
        DEFAULT_EVENT_STATUS,
        fallback,
        value && STATUS_MAP?.[value],
      ),
    [fallback, value],
  );
  return <Chip color={color} icon={icon} label={label} {...rest} />;
};

EventStatusBase.displayName = 'EventStatus';

export const EventStatus = Wrap(EventStatusBase);
