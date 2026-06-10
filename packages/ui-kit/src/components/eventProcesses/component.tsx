import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { Step, StepProps } from './steps';
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
    ...rest
  } = useConfig('EventProcesses', props);

  return (
    <div data-orientation={orientation} {...rest}>
      {items?.map((item, index) => (
        <Step key={index} active={value} setActive={onChange} {...item} />
      ))}
      {loading && <Skeleton attached variant="rounded" />}
    </div>
  );
};

EventProcesses.displayName = 'EventProcesses';
