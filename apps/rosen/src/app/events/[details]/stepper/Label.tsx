import React from 'react';

import { StepLabel } from '@mui/material';
import { Stack, Typography } from '@rosen-bridge/ui-kit';

import { Item } from '@/app/events/[details]/stepper/types';

/**
 *
 * @param step
 * @param onClick
 * @param icon
 * @constructor
 */
export const Label = ({
  step,
  onClick,
  icon,
}: {
  icon: React.ElementType;
  step: Item;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <StepLabel
      StepIconComponent={icon}
      onClick={onClick}
      sx={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <Typography noWrap variant="body2" color={'primary.main'}>
        {step.title}
      </Typography>
      <Typography noWrap variant="caption" color="text.secondary">
        {step.subtitle}
      </Typography>
    </StepLabel>
  );
};
