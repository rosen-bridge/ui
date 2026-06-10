import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { Step, StepProps } from './steps';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventProcessesOverrides {}

export type EventProcessesOwnProps = {
  items?: StepProps[];
  value?: string;
  setActive?: (value?:string) => void;
  orientation?: 'horizontal' | 'vertical';
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

/**
 * EventProcesses
 */
export const EventProcesses = (props: EventProcessesProps) => {
  const {
    orientation = 'horizontal',
    setActive,
    value,
    items,
    ...rest
  } = useConfig('EventProcesses', props);

  return (
    <div data-orientation={orientation} {...rest}>
      {items &&
        items.map((item,index) => (
          <Step key={index} active={value} setActive={setActive} {...item} />
        ))}
    </div>
  );
};

EventProcesses.displayName = 'EventProcesses';
