import React from 'react';

import { StepLabel } from '@mui/material';

import { Typography } from '../../base';
import { Item } from './types';

type LabelProps = {
  /**
   * The icon component to display for the step.
   * This will be passed to MUI's `StepLabel` as the `StepIconComponent`.
   */
  icon: React.ElementType;

  /**
   * The step data containing title and subtitle to be displayed.
   */
  step: Item;
};

/**
 * A custom step label component for use in steppers.
 *
 * Features:
 * - Displays a custom icon via MUI's `StepLabel` `StepIconComponent` prop.
 * - Shows the step title in primary color (`primary.main`) and the subtitle in secondary text color (`text.secondary`).
 * - Uses `Typography` with `noWrap` to truncate text and prevent overflow.
 * - Adds pointer cursor and disables text selection for a cleaner UI.
 *
 * @param props - The props for the component.
 * @returns A styled step label with icon, title, and subtitle.
 */
export const LabelStep = ({ step, icon }: LabelProps) => {
  const getColor = () => {
    switch (step.state) {
      case 'pending':
        return 'info.dark';
      case 'idle':
        return 'neutral.dark';
      default:
        return 'success.main';
    }
  };

  return (
    <StepLabel
      StepIconComponent={icon}
      sx={{ cursor: 'text', userSelect: 'none' }}
    >
      <Typography noWrap variant="body2" color={getColor()}>
        {step.title}
      </Typography>

      {step.state === 'done' && step.subtitle && (
        <Typography noWrap variant="caption" color="text.secondary">
          {step.subtitle}
        </Typography>
      )}
    </StepLabel>
  );
};
