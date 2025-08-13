'use client';

import { Check, Hourglass } from '@rosen-bridge/icons';
import { Stack, SvgIcon, Typography } from '@rosen-bridge/ui-kit';

import { Item } from '@/app/events/[details]/stepper/types';

/**
 * StepIcon component renders a circular icon representing the state of a step.
 *
 * The icon can be in one of three states:
 * - "done": shows a check mark with a success-colored background.
 * - "pending": shows an hourglass with an info-colored background.
 * - "idle": shows a "#" symbol with a neutral-colored background.
 *
 * @param state - The current state of the step. Determines the icon and background color.
 *
 * @example
 * <StepIcon state="done" />
 * <StepIcon state="pending" />
 * <StepIcon state="idle" />
 */
export const StepIcon = ({ state }: Item) => {
  const baseStyle = {
    borderRadius: '50%',
    width: 32,
    height: 32,
    cursor: 'pointer',
  };

  const backgroundColors: Record<Exclude<Item['state'], undefined>, string> = {
    done: 'success.main',
    pending: 'info.main',
    idle: 'neutral.main',
  };

  let iconContent: React.ReactNode;
  switch (state) {
    case 'done':
      iconContent = (
        <SvgIcon>
          <Check fontSize="small" color="#fff" />
        </SvgIcon>
      );
      break;
    case 'pending':
      iconContent = (
        <SvgIcon>
          <Hourglass fontSize="small" color="#fff" />
        </SvgIcon>
      );
      break;
    case 'idle':
      iconContent = (
        <Typography fontWeight="bold" color="#fff">
          #
        </Typography>
      );
      break;
    default:
      iconContent = null;
  }

  return (
    <Stack
      sx={{ ...baseStyle, backgroundColor: state && backgroundColors[state] }}
      justifyContent="center"
      alignItems="center"
    >
      {iconContent}
    </Stack>
  );
};
