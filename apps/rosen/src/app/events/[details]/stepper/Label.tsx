import React from 'react';

import { StepLabel } from '@mui/material';
import { Typography } from '@rosen-bridge/ui-kit';

import { Item } from '@/app/events/[details]/stepper/types';

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
export const Label = ({ step, icon }: LabelProps) => {
  return (
    <StepLabel
      StepIconComponent={icon}
      sx={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <Typography noWrap variant="body2" color="primary.main">
        {step.title}
      </Typography>
      <Typography noWrap variant="caption" color="text.secondary">
        {step.subtitle}
      </Typography>
    </StepLabel>
  );
};
