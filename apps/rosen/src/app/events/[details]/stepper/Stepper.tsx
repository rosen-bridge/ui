import { useMemo, useState } from 'react';

// TODO : move to ui-kit
import {
  Stepper,
  Step,
  StepConnector,
  Popper,
  StepContent,
} from '@mui/material';
import { Paper, Stack, Typography, useBreakpoint } from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';
import { Label } from '@/app/events/[details]/stepper/Label';
import { StepIcon } from '@/app/events/[details]/stepper/StateIcon';
import { Item, stepItem } from '@/app/events/[details]/stepper/types';

const mainSteps: stepItem[] = [
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
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approveqs2d3d',
        state: 'idle',
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

const Stepper1 = () => {
  const isMobile = useBreakpoint('tablet');
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleStepClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    if (!isMobile) {
      if (activeIndex === index) {
        setOpen(false);
        setActiveIndex(null);
      } else {
        setOpen(true);
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
      }
    } else {
      setActiveStep(index);
    }
  };

  const id = open ? 'popper-id' : undefined;

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Event Progress
      </Typography>
      <Stepper
        activeStep={!isMobile ? -1 : activeStep}
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        {mainSteps.map((step, index) => (
          <Step key={step.id}>
            <Label
              step={step}
              icon={(props) => <StepIcon {...props} state={step.state} />}
              onClick={(e) => handleStepClick(e, index)}
            />
            {!isMobile ? (
              <Popper
                id={id}
                open={
                  index === 0 || mainSteps.length - 1 === index
                    ? false
                    : open && activeIndex === index
                }
                anchorEl={anchorEl}
                placement="bottom"
              >
                <Paper
                  style={{
                    background: 'none',
                    boxShadow: 'none',
                  }}
                  elevation={3}
                >
                  <Stack
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                  >
                    <RenderDots />
                    {step.sub && step.sub.length > 0 && (
                      <Stack
                        direction="column"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                        justifyItems="center"
                      >
                        <Stepper
                          orientation={'horizontal'}
                          alternativeLabel
                          activeStep={activeStep}
                          connector={<StepConnector />}
                        >
                          {step.sub.map((sub) => (
                            <Step
                              style={{ width: '95px' }}
                              key={sub.id}
                              completed={sub.state === 'done'}
                            >
                              <Label
                                step={step}
                                icon={(props) => (
                                  <StepIcon {...props} state={sub.state} />
                                )}
                              />
                            </Step>
                          ))}
                        </Stepper>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Popper>
            ) : (
              <StepContent>
                <div
                  style={{
                    borderStyle: 'solid',
                    borderTopWidth: '0px',
                    borderBottomWidth: '0px',
                    borderRightWidth: '0px',
                    borderLeftWidth: '1px',
                    borderColor: '#bdbdbd',
                    minHeight: '24px',
                    marginLeft: '12px',
                  }}
                />
                <Stepper
                  orientation={'vertical'}
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
                          icon={(props) => (
                            <StepIcon {...props} state={sub.state} />
                          )}
                        />
                      </Step>
                    ))}
                </Stepper>
              </StepContent>
            )}
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

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
  );
};
export const StepperEvent = () => {
  return (
    <DetailsCard title="Event Progres">
      <div style={{ minHeight: '250px' }}>
        <Stepper1 />
      </div>
    </DetailsCard>
  );
};
