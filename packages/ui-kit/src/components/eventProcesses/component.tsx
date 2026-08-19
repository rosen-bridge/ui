import { type CSSProperties, useMemo, useRef } from 'react';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { StepExtra } from './stepExtra';
import { Step, type StepProps } from './steps';

import './styles.css';

export interface EventProcessesOverrides {}

export type EventProcessesOwnProps = {
  items?: StepProps[];
  loading?: boolean;
  orientation?: 'horizontal' | 'vertical';
  value?: string;
  onChange?: (value?: string) => void;
};

export type EventProcessesBaseProps = ElementBaseProps<'div', EventProcessesOwnProps>;

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

  const ref = useRef<HTMLDivElement>(null);

  const timeout = useRef<number>(-1);

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

  const handleSetActive = (newValue?: string) => {
    onChange?.(newValue);

    window.clearTimeout(timeout.current);

    if (!value || !newValue || value === newValue || !ref.current) return;

    const height = getComputedStyle(ref.current).height;

    ref.current.style.minHeight = height;

    timeout.current = window.setTimeout(() => {
      if (ref.current) {
        ref.current.style.minHeight = '';
      }
    }, 250);
  };

  return (
    <div data-orientation={orientation} ref={ref} style={{ ...styles }} {...rest}>
      {items?.map((item, index) => {
        if (item.line) return <StepExtra {...item} key={index.toString()} />;

        return <Step key={index.toString()} active={value} setActive={handleSetActive} {...item} />;
      })}
      {loading && <Skeleton attached variant="rounded" />}
    </div>
  );
};

EventProcesses.displayName = 'EventProcesses';
