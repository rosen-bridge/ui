'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// TODO : move to ui-kit
import {
  Stepper,
  Step,
  StepConnector,
  Popper,
  StepContent,
} from '@mui/material';
import {
  Card2,
  Card2Body,
  Card2Header,
  Paper,
  Stack,
  Typography,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';
import { Label } from '@/app/events/[details]/stepper/Label';
import { StepIcon } from '@/app/events/[details]/stepper/StepIcon';
import { SubStep } from '@/app/events/[details]/stepper/SubStep';
import { stepItem } from '@/app/events/[details]/stepper/types';

const amainSteps: stepItem[] = [
  {
    id: 'Tx Created1ascaca',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approdvfj32ved3',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approscedveved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approveqs2d3d',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Created332acs',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approv86ed23asc',
        state: 'done',
        title: 'Tx Apstepproved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approvedzasca',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approvascwedascasca',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedaXAXW',
    state: 'pending',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApprovxsedASCSACA',
        state: 'done',
        title: 'Tx ApprovedVVE',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovsxedCADC',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedsxsSDVSDVEQ',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApprovedCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedDCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved5DsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
];

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

const Stepper1 = ({ data }: { data: stepItem[] }) => {
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
    <Stepper
      activeStep={!isMobile ? -1 : activeStep}
      alternativeLabel={!isMobile}
      orientation={isMobile ? 'vertical' : 'horizontal'}
    >
      {data.map((step, index) => (
        <Step key={step.id}>
          <Label
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
    </Stepper>
  );
};

export const StepperEvent = () => {
  return (
    <DetailsCard sync title="Event Progres">
      <div style={{ minHeight: '250px' }}>
        <Stepper1 data={amainSteps} />
      </div>
    </DetailsCard>
  );
};
