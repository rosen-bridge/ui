import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { Step, StepProps } from './steps';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventProcessesOverrides {}

export type EventProcessesOwnProps = {
  items?: StepProps[];
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
    items,
    ...rest
  } = useConfig('EventProcesses', props);

  return (
    <div data-orientation={orientation} {...rest}>
      {items && items.length > 0 && <Step {...items} />}
    </div>
  );
};

EventProcesses.displayName = 'EventProcesses';
