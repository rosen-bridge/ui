import type { ReactNode } from 'react';

import {
  Card,
  CardBody,
  CircularProgress,
  Icon,
  type IconProps,
  Stack,
  Text,
  Tooltip,
  Truncate,
} from '@rosen-bridge/ui-kit';

export type InfoWidgetCardProps = {
  color?: 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error';
  icon: IconProps['name'];
  isLoading?: boolean;
  title: string;
  value: ReactNode;
  warning?: string;
};
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
    <Card backgroundColor={color}>
      <CardBody>
        <Stack direction="row" align="center" spacing={2}>
          <Icon
            color="primary-contrastText"
            fallback="ExclamationTriangle"
            name={icon}
            size="large"
          />
          <Stack direction="column" style={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" align="center" justify="between">
              <Text variant="display2" color="primary-contrastText">
                {isLoading && <CircularProgress size={16} color="inherit" />}
                {!isLoading && <Truncate lines={1}>{value}</Truncate>}
              </Text>
              {warning && (
                <Tooltip title={<div style={{ whiteSpace: 'pre' }}>{warning}</div>}>
                  <Icon color="primary-contrastText" name="ExclamationTriangleFill" size="small" />
                </Tooltip>
              )}
            </Stack>
            <Text as="div" variant="label1" color="primary-light" weight={500}>
              <Truncate lines={1}>{title}</Truncate>
            </Text>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
};
