import React, { HTMLAttributes, useEffect, useState } from 'react';

import {
  Step,
  StepConnector,
  StepContent,
  Stepper as StepperMui,
} from '@mui/material';

import { Box, Skeleton, Typography } from '../../base';
import { InjectOverrides } from '../InjectOverrides';
import { Stack } from '../Stack';
import { ProcessIcon } from './ProcessIcon';
import { ProcessLabel } from './ProcessLabel';
import { SubItem } from './SubItem';
import { ProcessTrackerStateIcon, ProcessTrackerItem } from './types';

const RenderDots = () => {
  return (
    <svg
      width="200"
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

export type ProcessTrackerProps = {
  loading?: boolean;
  orientation?: 'vertical' | 'horizontal';
  steps?: ProcessTrackerItem[];
} & HTMLAttributes<HTMLDivElement>;

const Loading = () => {
  return (
    <Skeleton
      variant="rounded"
      sx={{ width: '100%', height: '167px', display: 'block' }}
    />
  );
};

/**
 * ProcessTracker renders a multi-step tracker for processes or workflows.
 *
 * Features:
 * - Displays steps horizontally on desktop and vertically on mobile.
 * - Supports step states: "done", "pending", "idle".
 * - Shows custom icons for each step using `ProcessIcon`.
 * - Displays labels with optional tooltip info using `ProcessLabel`.
 * - Supports expandable sub-steps via `SubItem`.
 * - Automatically highlights the first non-done step.
 * - Handles mobile-specific expansion logic for steps.
 *
 * @param props - The props for the component.
 * @param props.steps - An array of step items describing each step, its state, and optional sub-steps.
 *
 * @example
 * <ProcessTracker
 *   data={[
 *     { id: 1, title: 'Step 1', state: 'done', doneStep: { date: '18 Aug 2025', description: 'Completed' }, sub: [] },
 *     { id: 2, title: 'Step 2', state: 'pending', sub: [] },
 *     { id: 3, title: 'Step 3', state: 'idle', sub: [] },
 *   ]}
 * />
 *
 * @returns A responsive stepper component showing the process tracker with icons, labels, tooltips, and sub-steps.
 */
const ProcessTrackerBase = ({
  loading,
  orientation,
  steps = [],
  ...props
}: ProcessTrackerProps) => {
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const findFirstNotDoneIndex = (steps: ProcessTrackerItem[]) =>
    steps.findIndex(
      (step) =>
        step.state !== 'done' || step.sub?.some((sub) => sub.state !== 'done'),
    );

  const shouldShowSubStep = (index: number) =>
    index !== 0 && index !== steps.length - 1 && activeIndex === index;

  const toggleStep = (index: number, state: ProcessTrackerStateIcon) => {
    if (state !== 'done') return;

    setActiveSteps((prev) => {
      const pendingSteps = steps
        .map((s, i) => (s.state === 'pending' ? i : -1))
        .filter((i) => i !== -1);

      if (prev.includes(index)) return pendingSteps;

      return [...pendingSteps, index];
    });
  };

  useEffect(() => {
    if (!steps || steps.length === 0) return;

    const firstIndex = findFirstNotDoneIndex(steps);
    if (firstIndex === -1) return;

    setActiveIndex(firstIndex);
    if (orientation === 'vertical') {
      setActiveSteps([firstIndex]);
    } else {
      setActiveSteps([]);
    }
  }, [steps, orientation]);

  const content = (
    <StepperMui
      activeStep={-1}
      alternativeLabel={orientation === 'horizontal'}
      orientation={orientation}
      connector={
        <StepConnector
          style={{ marginTop: orientation === 'horizontal' ? '4px' : 'unset' }}
        />
      }
    >
      {steps.map((step, index) => (
        <Step
          key={step.id}
          expanded={orientation === 'vertical' && activeSteps.includes(index)}
        >
          <ProcessLabel
            info={
              step.state === 'done' && orientation === 'horizontal'
                ? {
                    subTittle: step.subtitle,
                    description: step.description,
                  }
                : undefined
            }
            step={step}
            icon={(props) => (
              <ProcessIcon {...props} state={step.state} index={index + 1} />
            )}
            onClick={
              orientation === 'vertical' && step.state === 'done'
                ? () => toggleStep(index, step.state as ProcessTrackerStateIcon)
                : undefined
            }
          />
          {/* Mobile */}
          {orientation === 'vertical' && (
            <StepContent>
              {step.state === 'pending' ? (
                <SubItem activeStep={index} dance step={step} />
              ) : step.state === 'done' ? (
                <Box
                  display="block"
                  sx={{
                    width: '100%',
                    backgroundColor: 'success.light',
                    padding: 1,
                    borderRadius: (theme) => theme.spacing(1),
                  }}
                  onClick={() =>
                    toggleStep(index, step.state as ProcessTrackerStateIcon)
                  }
                >
                  <Typography color="success.main" variant="body2">
                    {step.subtitle}
                  </Typography>
                  <Typography color="success.dark" variant="body2">
                    {step.description}
                  </Typography>
                </Box>
              ) : null}
              {step.state !== 'done' &&
                step.state !== 'pending' &&
                step.sub && <SubItem activeStep={index} dance step={step} />}
            </StepContent>
          )}
          {/* Desktop */}
          {orientation === 'horizontal' && shouldShowSubStep(index) && (
            <Stack
              direction="column"
              align="center"
              justify="center"
              spacing={1}
              style={{ marginTop: '8px' }}
            >
              {step.sub && step.sub?.length > 0 && (
                <Stack
                  direction="column"
                  spacing={2}
                  align="center"
                  style={{
                    width: '0',
                  }}
                >
                  <RenderDots />
                  <SubItem step={step} activeStep={activeIndex ?? 0} />
                </Stack>
              )}
            </Stack>
          )}
        </Step>
      ))}
    </StepperMui>
  );

  return <div {...props}>{loading ? <Loading /> : content}</div>;
};

export const ProcessTracker = InjectOverrides(ProcessTrackerBase);
