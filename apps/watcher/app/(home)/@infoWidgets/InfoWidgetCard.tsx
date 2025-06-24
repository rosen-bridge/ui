import { ReactNode } from 'react';

import { ExclamationTriangle } from '@rosen-bridge/icons';
import {
  Box,
  CircularProgress,
  SvgIcon,
  InfoWidgetCardBase,
  Tooltip,
  Typography,
} from '@rosen-bridge/ui-kit';
import { AugmentedPalette } from '@rosen-ui/types';

interface InfoWidgetCardProps {
  color?: keyof AugmentedPalette;
  icon: ReactNode;
  isLoading?: boolean;
  title: string;
  value: ReactNode;
  warning?: string;
}
/**
 * render an info widget card containing data
 *
 * @param color
 * @param icon
 * @param isLoading
 * @param title
 * @param value
 */
export const InfoWidgetCard = ({
  color = 'secondary',
  icon,
  isLoading,
  title,
  value,
  warning,
}: InfoWidgetCardProps) => {
  return (
    <InfoWidgetCardBase widgetColor={color}>
      <Box className="column">{icon}</Box>
      <Box className="column" flexGrow={1}>
        {isLoading ? (
          <div>
            <CircularProgress size={16} color="inherit" />
          </div>
        ) : (
          <Typography className="value">
            <div>{value}</div>
            {warning && (
              <Tooltip
                title={<div style={{ whiteSpace: 'pre' }}>{warning}</div>}
              >
                <SvgIcon>
                  <ExclamationTriangle />
                </SvgIcon>
              </Tooltip>
            )}
          </Typography>
        )}
        <Typography className="title">{title}</Typography>
      </Box>
    </InfoWidgetCardBase>
  );
};
