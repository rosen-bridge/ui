import { Step, StepConnector, Stepper } from '@mui/material';

import { ProcessIcon } from './ProcessIcon';
import { ProcessLabel } from './ProcessLabel';
import { ProcessTrackerItem } from './types';

type SubStepProps = {
  /**
   * The index of the currently active sub-step.
   * If undefined, no sub-step is marked as active.
   */
  activeStep: number | undefined;

  /**
   * The main step object that contains sub-steps information.
   * Each sub-step should have an `id` and `state`.
   */
  step: ProcessTrackerItem;

  /**
   * Optional flag to switch the stepper orientation.
   * - `true`: vertical layout
   * - `false` or undefined: horizontal layout
   */
  dance?: boolean;
};

/**
 * SubItem renders a nested stepper to display sub-steps within a main process step.
 *
 * Features:
 * - Supports horizontal and vertical layouts (controlled by `dance` prop).
 * - Highlights the active sub-step based on `activeStep`.
 * - Displays each sub-step state using `ProcessIcon`.
 * - Displays each sub-step label using `ProcessLabel`.
 * - Marks completed sub-steps automatically based on their `state`.
 *
 * @param props - The props for the component.
 * @param props.activeStep - Index of the currently active sub-step.
 * @param props.step - The main step object containing sub-steps.
 * @param props.dance - Optional boolean to switch orientation (vertical if true, horizontal otherwise).
 *
 * @example
 * <SubItem
 *   activeStep={1}
 *   step={{
 *     id: 1,
 *     title: 'Step 1',
 *     state: 'done',
 *     sub: [
 *       { id: 11, title: 'Sub 1', state: 'done' },
 *       { id: 12, title: 'Sub 2', state: 'pending' }
 *     ]
 *   }}
 *   dance={false}
 * />
 *
 * @returns A nested Stepper component showing sub-steps with icons and labels.
 */
export const SubItem = ({ activeStep, dance, step }: SubStepProps) => {
  return (
    <Stepper
      orientation={dance ? 'vertical' : 'horizontal'}
      alternativeLabel={!dance}
      activeStep={activeStep}
      connector={
        <StepConnector style={{ marginTop: dance ? 'unset' : '4px' }} />
      }
    >
      {step.sub &&
        step.sub.map((sub, index) => (
          <Step
            style={{ width: '97px', marginTop: !dance ? '-10px' : undefined }}
            key={sub.id}
            completed={sub.state === 'done'}
          >
            {dance && index === 0 && (
              <div
                style={{
                  borderLeft: '1px solid #bdbdbd',
                  minHeight: 24,
                  marginLeft: 12,
                }}
              />
            )}
            <ProcessLabel
              step={sub}
              icon={(props) => (
                <ProcessIcon {...props} state={sub.state} index={index + 1} />
              )}
            />
          </Step>
        ))}
    </Stepper>
  );
};
