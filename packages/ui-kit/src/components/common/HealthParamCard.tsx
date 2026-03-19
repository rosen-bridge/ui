import { useMemo } from 'react';

import { HealthParamInfo } from '@rosen-ui/types';

import { Color } from '@/types';

import { Card, CardBody, CardHeader, CardTitle } from '.';
import { useTheme } from '../../hooks';
import { Alert } from '../base';
import { Icon, IconProps } from '../icon';
import { Stack } from '../stack';
import { Tooltip } from '../tooltip';
import { Typography } from '../typography';
import { Button } from './Button';

export type HealthParamCardProps = HealthParamInfo & {
  checking?: boolean;
  handleCheckNow: () => void;
};
/**
 * render a healt param card to be used in health page
 *
 * @param id
 * @param title
 * @param details
 * @param status
 * @param description
 * @param lastCheck
 * @param lastTrialErrorMessage
 * @param lastTrialErrorTime
 * @param checking
 * @param handleCheckNow
 */
export const HealthParamCard = ({
  title,
  details,
  status,
  description,
  lastCheck,
  lastTrialErrorMessage,
  lastTrialErrorTime,
  checking,
  handleCheckNow,
}: HealthParamCardProps) => {
  const theme = useTheme();

  const color = useMemo(() => {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'Unstable':
        return 'warning';
      default:
        return 'error';
    }
  }, [status]);

  const colors = useMemo(() => {
    if (lastCheck) {
      return {
        cardBackground: `${color}.light`,
        cardColor: `${color}-dark`,
        button: color,
        alertBackground: `${color}.main`,
        alert: `${color}.light`,
      };
    } else {
      return {
        cardBackground: theme.palette.neutral.light,
        cardColor: 'inherit',
        button: 'inherit',
        alertBackground: 'inherit',
        alert: 'inherit',
      };
    }
  }, [color, lastCheck, theme]);

  const icon = useMemo<IconProps['name']>(() => {
    if (!lastCheck) return 'ShieldQuestion';
    if (status === 'Healthy') return 'ShieldCheck';
    return 'ShieldExclamation';
  }, [lastCheck, status]);

  const formattedLastCheck = useMemo(() => {
    if (!lastCheck) return;
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(lastCheck));
  }, [lastCheck]);

  return (
    <Card
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      backgroundColor={colors.cardBackground}
    >
      <CardHeader
        action={
          lastTrialErrorTime && (
            <Tooltip title={lastTrialErrorMessage}>
              <Icon color="warning" name="ExclamationTriangle" />
            </Tooltip>
          )
        }
      >
        <Stack spacing={2} direction="row">
          <Icon color={colors.cardColor as Color} name={icon} />
          <CardTitle>
            <Typography color={colors.cardColor as Color} fontWeight="700">
              {lastCheck ? status : 'Unknown'}
            </Typography>
          </CardTitle>
        </Stack>
      </CardHeader>
      <CardBody style={{ height: '100%' }}>
        <Stack style={{ flex: 1, height: '100%' }}>
          <Typography gutterBottom>{title}</Typography>
          <Typography variant="body2">{description}</Typography>
          {details && (
            <Alert
              variant="filled"
              sx={{
                bgcolor: colors.alertBackground,
                color: colors.alert,
                mt: 2,
                wordBreak: 'normal',
                overflowWrap: 'break-word',
              }}
            >
              {details}
            </Alert>
          )}
          <Typography variant="body2" style={{ marginTop: 'auto' }}>
            {/* Note that "Check now" feature only works with a real watcher
          instance and its functionality cannot be mocked now */}
            <Button
              loading={checking}
              size="small"
              variant="text"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              color={colors.button as any}
              style={{ fontSize: 'inherit' }}
              onClick={handleCheckNow}
            >
              {checking ? 'Checking' : 'Check now'}
            </Button>
            {formattedLastCheck && `(Last check: ${formattedLastCheck})`}
          </Typography>
        </Stack>
      </CardBody>
    </Card>
  );
};
