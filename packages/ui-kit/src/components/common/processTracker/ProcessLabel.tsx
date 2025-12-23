import React from 'react';

import { StepLabel } from '@mui/material';

import { Tooltip, Typography } from '../../base';
import { Stack } from '../Stack';
import { ProcessTrackerSubItem } from './types';

type LabelProps = {
  /**
   * The icon component to display for the step.
   * This will be passed to MUI's `StepLabel` as the `StepIconComponent`.
   */
  icon: React.ElementType;

  /**
   * Optional additional information to show in a tooltip.
   * If not provided, the tooltip will not be rendered.
   */
  info?: {
    subTittle: string;
    description: string;
  };

  /**
   * The step data containing title, subtitle, and state.
   */
  step: ProcessTrackerSubItem;

  /**
   * Optional click handler for the step label.
   */
  onClick?: () => void;
};

/**
 * ProcessLabel renders a custom label for a process tracker step.
 *
 * Features:
 * - Displays a custom icon via MUI's `StepLabel` `StepIconComponent` prop.
 * - Shows the step title and optionally a subtitle.
 * - Displays a tooltip with additional information (`info`) if provided.
 * - Uses `Typography` with `noWrap` to prevent text overflow.
 * - Adds pointer cursor and disables text selection for cleaner UI.
 *
 * @param props - The props for the component.
 * @param props.icon - The icon component to use for the step.
 * @param props.step - The step data containing title, subtitle, and state.
 * @param props.info - Optional tooltip information to show on hover.
 * @param props.onClick - Optional click handler for the step label.
 *
 * @example
 * <ProcessLabel
 *   step={{ title: 'Step 1', subtitle: 'Optional subtitle', state: 'done' }}
 *   icon={ProcessIcon}
 *   info={{ date: '18 Aug 2025', description: 'Completed successfully' }}
 * />
 *
 * @returns A styled StepLabel with optional tooltip.
 */
export const ProcessLabel = ({ icon, info, step, onClick }: LabelProps) => {
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

  const content = (
    <StepLabel
      slots={{
        stepIcon: icon,
      }}
      sx={{
        'cursor': 'text ',
        'userSelect': 'none',
        '& .MuiStepLabel-labelContainer': {
          cursor: 'text',
        },
        '& .MuiStepLabel-iconContainer': {
          cursor: 'text',
          pointerEvents: 'none',
        },
        '& .MuiSvgIcon-root': {
          cursor: 'text',
        },
      }}
      onClick={onClick}
    >
      <Typography
        sx={{ cursor: 'text' }}
        noWrap
        variant="body2"
        color={getColor()}
      >
        {step.title}
      </Typography>
    </StepLabel>
  );

  if (!info) return content;

  return (
    <Tooltip
      arrow
      slotProps={{
        tooltip: {
          sx: {
            'backgroundColor': 'success.light',
            'color': 'black',
            'cursor': 'text',
            'padding': 1,
            'borderRadius': 1,
            '& .MuiTooltip-arrow': {
              color: 'success.light',
            },
          },
        },
      }}
      title={
        <Stack style={{ cursor: 'text' }}>
          <Typography textAlign="center" color="success.main" variant="body2">
            {info.subTittle}
          </Typography>
          <Typography color="success.dark" variant="body2">
            {info.description}
          </Typography>
        </Stack>
      }
    >
      {content}
    </Tooltip>
  );
};
