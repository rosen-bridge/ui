import { useEffect, useState } from 'react';

import { Step, StepContent, Stepper as StepperMui } from '@mui/material';

import { useBreakpoint } from '../../../hooks';
import { Stack } from '../../base';
import { LabelStep } from './LabelStep';
import { StepIcon } from './StepIcon';
import { SubStep } from './SubStep';
import { stepItem } from './types';

const RenderDots = () => {
  return (
    <svg
      width="193"
      height="17"
      viewBox="0 0 193 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="95.3525"
        y1="-2.85718e-08"
        x2="95.3525"
        y2="12"
        stroke="#737373"
        strokeDasharray="2 2"
      />
      <line
        x1="0.764893"
        y1="12.5"
        x2="192"
        y2="12.5"
        stroke="#737373"
        strokeDasharray="2 2"
      />
      <line x1="0.5" y1="9" x2="0.5" y2="17" stroke="#737373" />
      <line x1="192.5" y1="9" x2="192.5" y2="17" stroke="#737373" />
    </svg>
  );
};

export const Stepper = ({ data }: { data: stepItem[] }) => {
  const isMobile = useBreakpoint('laptop-down');
  const [activeStep, setActiveStep] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const findFirstNotDoneIndex = (steps: stepItem[]) =>
    steps.findIndex(
      (step) =>
        step.state !== 'done' || step.sub?.some((sub) => sub.state !== 'done'),
    );

  const shouldShowSubStep = (index: number) =>
    index !== 0 && index !== data.length - 1 && activeIndex === index;

  useEffect(() => {
    if (!data || data.length === 0) return;

    const firstIndex = findFirstNotDoneIndex(data);
    if (firstIndex !== -1) {
      if (isMobile) setActiveStep(firstIndex);
      else setActiveIndex(firstIndex);
    }
  }, [isMobile, data]);

  return (
    <StepperMui
      activeStep={!isMobile ? -1 : activeStep}
      alternativeLabel={!isMobile}
      orientation={isMobile ? 'vertical' : 'horizontal'}
    >
      {data.map((step, index) => (
        <Step key={step.id}>
          <LabelStep
            step={step}
            icon={(props) => <StepIcon {...props} state={step.state} />}
          />

          {isMobile ? (
            <StepContent>
              <div
                style={{
                  borderLeft: '1px solid #bdbdbd',
                  minHeight: 24,
                  marginLeft: 12,
                }}
              />
              <SubStep activeStep={activeStep} dance step={step} />
            </StepContent>
          ) : (
            shouldShowSubStep(index) && (
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                gap={1}
                style={{ position: 'relative', top: '8px' }}
              >
                <RenderDots />
                {step.sub && step.sub?.length > 0 && (
                  <Stack
                    direction="column"
                    spacing={2}
                    alignItems="center"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                    }}
                  >
                    <SubStep step={step} activeStep={activeStep} />
                  </Stack>
                )}
              </Stack>
            )
          )}
        </Step>
      ))}
    </StepperMui>
  );
};
