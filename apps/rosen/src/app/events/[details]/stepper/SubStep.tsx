'use client';

import { Step, StepConnector, Stepper } from '@mui/material';

import { Label } from '@/app/events/[details]/stepper/Label';
import { StepIcon } from '@/app/events/[details]/stepper/StateIcon';
import { stepItem } from '@/app/events/[details]/stepper/types';

type SubStepProps = {
  activeStep: number | undefined;
  step: stepItem;
  dance?: boolean;
};

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
