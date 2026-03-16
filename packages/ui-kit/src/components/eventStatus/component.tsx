import { ComponentProps, useMemo } from 'react';

import { OverridableType } from '@/@types';
import { Chip, ChipProps, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

import { STATUS_MAP } from './constants';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventStatusOverrides {}

export type EventStatusMeta = {
  label: string;
  color: ChipProps['color'];
  icon: IconOverriddenProps['name'];
};

export type EventStatusOwnProps = {
  fallback?: EventStatusMeta;
  value?: keyof typeof STATUS_MAP;
};

export type EventStatusBaseProps = ElementBaseProps<
  typeof Chip,
  EventStatusOwnProps
>;

export type EventStatusOverriddenProps = OverridableType<
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
}: EventStatusOverriddenProps) => {
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
  return <Root as={Chip} color={color} icon={icon} label={label} {...rest} />;
};

EventStatusBase.displayName = 'EventStatus';

export const EventStatus = Wrap(EventStatusBase);

export type EventStatusProps = ComponentProps<typeof EventStatus>;
