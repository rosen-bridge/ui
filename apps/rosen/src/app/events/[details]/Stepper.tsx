import { useState } from 'react';

// TODO : move to ui-kit
import { Stepper, Step, StepLabel, StepConnector } from '@mui/material';
import { Check } from '@rosen-bridge/icons';
import { Box, Stack, styled, Typography } from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

const StepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed
    ? theme.palette.success.main
    : ownerState.active
      ? theme.palette.primary.main
      : theme.palette.grey[400],
  color: '#fff',
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

function StepIcon(props: any) {
  const { active, completed } = props;
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? (
        <Check fontSize="small" />
      ) : active ? (
        <span style={{ fontWeight: 'bold' }}>#</span>
      ) : (
        <span style={{ fontWeight: 'bold' }}>#</span>
      )}
    </StepIconRoot>
  );
}

const SubStepIconRoot = styled('div')<{ ownerState: { completed?: boolean } }>(
  ({ theme, ownerState }) => ({
    backgroundColor: ownerState.completed
      ? theme.palette.success.main
      : theme.palette.grey[400],
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
  }),
);

function SubStepIcon(props: any) {
  const { completed } = props;
  return (
    <SubStepIconRoot ownerState={{ completed }}>
      {completed ? <Check fontSize="small" color="#fff" /> : <span>#</span>}
    </SubStepIconRoot>
  );
}

const mainSteps = [
  {
    label: 'Tx Created',
    date: '5/4/2025',
    completed: true,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'In Payment',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'Reward',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
];

export default function HorizontalNestedStepper() {
  const [activeMainStepIndex, setActiveMainStepIndex] = useState(1);
  const activeSubSteps = mainSteps[activeMainStepIndex]?.subSteps || [];

  const handleStepClick = (index: number) => {
    setActiveMainStepIndex(index);
  };

  return (
    <Box
      sx={{ width: '100%', position: 'relative', padding: 4, height: '250px' }}
    >
      <Stepper
        alternativeLabel
        activeStep={activeMainStepIndex}
        connector={<StepConnector />}
      >
        {mainSteps.map((step, index) => (
          <Step
            key={step.label}
            completed={step.completed}
            active={index === activeMainStepIndex}
            onClick={() => handleStepClick(index)}
          >
            <StepLabel StepIconComponent={StepIcon}>
              <Typography
                variant="body2"
                color={
                  step.completed
                    ? 'success.main'
                    : index === activeMainStepIndex
                      ? 'primary.main'
                      : 'text.primary'
                }
              >
                {step.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {step.date}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        sx={{
          position: 'absolute',
          top: 130,
          left: `calc(50% + ${(activeMainStepIndex - mainSteps.length / 2 + 0.5) * 33.33}%)`,
          width: '33.33%',
          transform: 'translateX(-45%)',
        }}
      >
        {activeSubSteps.length > 0 && (
          <Stack
            direction="column"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
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
                stroke-dasharray="2 2"
              />
              <line
                x1="0.764893"
                y1="12.5"
                x2="192"
                y2="12.5"
                stroke="#737373"
                stroke-dasharray="2 2"
              />
              <line x1="0.5" y1="9" x2="0.5" y2="17" stroke="#737373" />
              <line x1="192.5" y1="9" x2="192.5" y2="17" stroke="#737373" />
            </svg>
            <Stepper
              alternativeLabel
              activeStep={-1}
              connector={<StepConnector />}
            >
              {activeSubSteps.map((step) => (
                <Step key={step.label} completed={step.completed}>
                  <StepLabel StepIconComponent={SubStepIcon}>
                    <Typography
                      variant="body2"
                      color={step.completed ? 'success.main' : 'text.primary'}
                    >
                      {step.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.date}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export const StepperEvent = () => {
  return (
    <DetailsCard title="Event Progres">
      <HorizontalNestedStepper />
    </DetailsCard>
  );
};
