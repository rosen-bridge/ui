import { ReactNode } from 'react';

import { ExclamationTriangleFill } from '@rosen-bridge/icons';
import {
  SvgIcon,
  Tooltip,
  Typography,
  Stack,
  Card,
  CardBody,
  Truncate,
  CircularProgress,
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
    <Card backgroundColor={`${color}.main`}>
      <CardBody>
        <Stack direction="row" align="center" spacing={2}>
          <SvgIcon color="primary.contrastText" size="large">
            {icon}
          </SvgIcon>
          <Stack direction="column" style={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" align="center" justify="between">
              <Typography
                variant="h6"
                color="primary.contrastText"
                lineHeight="normal"
              >
                {isLoading && <CircularProgress size={16} color="inherit" />}
                {!isLoading && <Truncate lines={1}>{value}</Truncate>}
              </Typography>
              {warning && (
                <Tooltip
                  title={<div style={{ whiteSpace: 'pre' }}>{warning}</div>}
                >
                  <SvgIcon color="primary.contrastText" size="small">
                    <ExclamationTriangleFill />
                  </SvgIcon>
                </Tooltip>
              )}
            </Stack>
            <Typography
              variant="body2"
              color="primary.contrastText"
              style={{ opacity: 0.6 }}
            >
              <Truncate lines={1}>{title}</Truncate>
            </Typography>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
};
