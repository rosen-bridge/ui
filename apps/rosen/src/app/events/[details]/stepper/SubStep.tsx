'use client';

import { Step, StepConnector, Stepper } from '@mui/material';

import { Label } from '@/app/events/[details]/stepper/Label';
import { StepIcon } from '@/app/events/[details]/stepper/StepIcon';
import { stepItem } from '@/app/events/[details]/stepper/types';

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
  step: stepItem;

  /**
   * Optional flag to switch the stepper orientation.
   * - `true`: vertical layout
   * - `false` or undefined: horizontal layout
   */
  dance?: boolean;
};

/**
 * Renders a nested stepper for displaying the sub-steps of a main step.
 * Supports both horizontal and vertical layouts, and shows the state of each sub-step with a custom icon.
 */
export const SubStep = ({ activeStep, step, dance }: SubStepProps) => {
  return (
    <Stepper
      orientation={dance ? 'vertical' : 'horizontal'}
      alternativeLabel={!dance}
      activeStep={activeStep}
      connector={<StepConnector />}
    >
      {step.sub &&
        step.sub.map((sub) => (
          <Step
            style={{ width: '95px' }}
            key={sub.id}
            completed={sub.state === 'done'}
          >
            <Label
              step={step}
              icon={(props) => <StepIcon {...props} state={sub.state} />}
            />
          </Step>
        ))}
    </Stepper>
  );
};
