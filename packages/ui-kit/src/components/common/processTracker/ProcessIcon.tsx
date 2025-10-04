import { ReactNode } from 'react';

import { Check, Hourglass } from '@rosen-bridge/icons';

import { StackMui, SvgIcon, Typography } from '../../base';
import { ProcessTrackerStateIcon } from './types';

/**
 * ProcessIcon renders a circular icon representing the state of a process step.
 *
 * The icon visually indicates one of three states:
 * - `"done"`: shows a check mark with a success-colored background.
 * - `"pending"`: shows an hourglass with an info-colored background.
 * - `"idle"`: shows the step index number with a neutral-colored background.
 *
 * @param props - The properties for the component.
 * @param props.state - The current state of the step. Determines the icon and background color.
 * @param props.index - The index of the step (used when `state` is `"idle"`).
 *
 * @example
 * <ProcessIcon state="done" index={1} />
 * <ProcessIcon state="pending" index={2} />
 * <ProcessIcon state="idle" index={3} />
 *
 * @returns A circular stack component containing the icon representing the step's state.
 */
export const ProcessIcon = ({
  index,
  state,
}: {
  state: ProcessTrackerStateIcon;
  index: number;
}) => {
  const baseStyle = {
    borderRadius: '50%',
    width: 32,
    height: 32,
    cursor: 'pointer',
  };

  const backgroundColors: Record<ProcessTrackerStateIcon, string> = {
    done: 'success.main',
    pending: 'info.main',
    idle: 'neutral.main',
  };

  let iconContent: ReactNode;
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
          {index}
        </Typography>
      );
      break;
  }

  return (
    <StackMui
      sx={{ ...baseStyle, backgroundColor: backgroundColors[state] }}
      justifyContent="center"
      alignItems="center"
    >
      {iconContent}
    </StackMui>
  );
};
