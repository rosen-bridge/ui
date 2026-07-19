import { type CSSProperties, useMemo } from 'react';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { StepExtra } from './stepExtra';
import { Step, type StepProps } from './steps';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventProcessesOverrides {}

export type EventProcessesOwnProps = {
  items?: StepProps[];
  loading?: boolean;
  orientation?: 'horizontal' | 'vertical';
  value?: string;
  onChange?: (value?: string) => void;
};

export type EventProcessesBaseProps = ElementBaseProps<
  'div',
  EventProcessesOwnProps
>;

export type EventProcessesProps = OverridableType<
  EventProcessesBaseProps,
  EventProcessesOverrides,
  never
>;

export const EventProcesses = (props: EventProcessesProps) => {
  const {
    items,
    loading,
    orientation = 'horizontal',
    value,
    onChange,
    style,
    ...rest
  } = useConfig('EventProcesses', props);

  const gridTemplateColumns = useMemo(() => {
    if (!items?.length) return '';

    return items
      .map((item) => {
        if (item.line) {
          return 'minmax(0, 0)';
        }
        return 'minmax(0, 1fr)';
      })
      .join(' ');
  }, [items]);

  const styles = useMemo(() => {
    return {
      gridTemplateColumns: gridTemplateColumns,
      ...style,
    } as CSSProperties;
  }, [gridTemplateColumns, style]);

  return (
    <div style={{ ...styles }} data-orientation={orientation} {...rest}>
      {items?.map((item, index) => {
        if (item.line) return <StepExtra {...item} key={index.toString()} />;

        return (
          <Step
            key={index.toString()}
            active={value}
            setActive={onChange}
            {...item}
          />
        );
      })}
      {loading && <Skeleton attached variant="rounded" />}
    </div>
  );
};

EventProcesses.displayName = 'EventProcesses';
