import type { CSSProperties } from 'react';

import {
  DateTime,
  Divider,
  Label,
  Popover,
  PopoverBody,
  PopoverTrigger,
  Skeleton,
  Stack,
  Text,
} from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface EventProcessesOverrides {}

export type EventProcessesOwnProps = {
  items?: {
    title: string;
    subtitle?: string;
    description?: string;
    datetime?: Date;
    state: 'done' | 'warning' | 'error' | 'pending' | 'disabled' | 'progress';
    subs?: EventProcessesOwnProps['items'];
  }[];
  loading?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

export type EventProcessesBaseProps = ElementBaseProps<'div', EventProcessesOwnProps>;

export type EventProcessesProps = OverridableType<
  EventProcessesBaseProps,
  EventProcessesOverrides,
  never
>;

export const EventProcesses = (props: EventProcessesProps) => {
  const {
    items = [],
    loading,
    orientation = 'horizontal',
    style,
    ...rest
  } = useConfig('EventProcesses', props);

  if (loading) return <Skeleton variant="rounded" height="102px" />;

  return (
    <div
      data-orientation={orientation}
      style={{ '--EventProcesses-item-count': items.length, ...style } as CSSProperties}
      {...rest}
    >
      {items.map((item) => {
        const hasDetails = Boolean(item.description || item.datetime || item.subs?.length);

        const chevron = (
          <div className={`RosenEventProcesses-chevron RosenEventProcesses-chevron--${item.state}`}>
            <span className="RosenEventProcesses-title">{item.title}</span>
            <span className="RosenEventProcesses-subtitle">{item.subtitle}</span>
            {!!item.subs?.length && (
              <div className="RosenEventProcesses-steps">
                {item.subs.map((sub) => (
                  <span
                    key={sub.title}
                    className={`RosenEventProcesses-step RosenEventProcesses-step--${sub.state}`}
                  />
                ))}
              </div>
            )}
          </div>
        );

        return (
          <div className="RosenEventProcesses-slot" key={item.title}>
            {hasDetails ? (
              <Popover>
                <PopoverTrigger as="div" className="RosenEventProcesses-anchor" openOnHover>
                  {chevron}
                </PopoverTrigger>
                <PopoverBody offset={[0, 8]} style={{ width: '280px' }}>
                  <Stack spacing="4px">
                    <Text variant="heading4" color="text-primary">
                      {item.title}
                    </Text>
                    {item.description && <Text color="text-secondary">{item.description}</Text>}
                    {item.datetime && (
                      <DateTime timestamp={item.datetime.getTime()} color="text-disabled" />
                    )}
                    {!!item.subs?.length && (
                      <>
                        <Divider />
                        <div>
                          {item.subs.map((sub) => (
                            <Label key={sub.title} label={sub.title} orientation="horizontal" dense>
                              {sub.datetime ? (
                                <DateTime
                                  timestamp={sub.datetime?.getTime()}
                                  color="text-disabled"
                                  style={{ fontSize: '12px' }}
                                />
                              ) : (
                                '-'
                              )}
                            </Label>
                          ))}
                        </div>
                      </>
                    )}
                  </Stack>
                </PopoverBody>
              </Popover>
            ) : (
              <div className="RosenEventProcesses-anchor">{chevron}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

EventProcesses.displayName = 'EventProcesses';
