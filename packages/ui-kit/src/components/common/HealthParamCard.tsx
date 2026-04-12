import { useMemo } from 'react';

import { HealthParamInfo } from '@rosen-ui/types';

import {
  Alert,
  Button,
  Card,
  CardAction,
  CardBody,
  CardHeader,
  CardTitle,
  Icon, 
  IconProps,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@/components';
import { ColorOverridden } from '@/types';

export type HealthParamCardProps = {
  checking?: boolean;
  handleCheckNow?: () => void;
  loading?: boolean;
  value?: HealthParamInfo;
};
/**
 * render a health param card to be used in health page
 */
export const HealthParamCard = ({
  checking,
  handleCheckNow,
  loading,
  value,
}: HealthParamCardProps) => {
  const color = useMemo(() => {
    switch (value?.status) {
      case 'Healthy':
        return 'success';
      case 'Unstable':
        return 'warning';
      default:
        return 'error';
    }
  }, [value?.status]);

  const colors = useMemo(() => {
    if (value?.lastCheck) {
      return {
        cardBackground: `${color}-light`,
        cardColor: `${color}-dark`,
        button: color,
        alertBackground: `${color}.main`,
        alert: `${color}.light`,
      };
    } else {
      return {
        cardBackground: 'neutral-light',
        cardColor: 'inherit',
        button: 'inherit',
        alertBackground: 'inherit',
        alert: 'inherit',
      };
    }
  }, [color, value?.lastCheck]);

  const icon = useMemo<IconProps['name']>(() => {
    if (!value?.lastCheck) return 'ShieldQuestion';
    if (value?.status === 'Healthy') return 'ShieldCheck';
    return 'ShieldExclamation';
  }, [value?.lastCheck, value?.status]);

  const formattedLastCheck = useMemo(() => {
    if (!value?.lastCheck) return;
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(value.lastCheck));
  }, [value?.lastCheck]);

  if (loading) {
    return <Skeleton height={180} variant="rounded" />;
  }

  return (
    <Card
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      backgroundColor={colors.cardBackground as ColorOverridden}
    >
      <CardHeader>
        <Icon color={colors.cardColor as ColorOverridden} name={icon} />
        <CardTitle color={colors.cardColor as ColorOverridden} fontWeight="700">
          {value?.lastCheck ? value?.status : 'Unknown'}
        </CardTitle>
        {value?.lastTrialErrorTime && (
          <CardAction>
            <Tooltip title={value.lastTrialErrorMessage}>
              <Icon color="warning" name="ExclamationTriangle" />
            </Tooltip>
          </CardAction>
        )}
      </CardHeader>
      <CardBody
        style={{
          height: '100%',
          display: 'flex',
          flexFlow: 'column',
          flex: '1 1 0%',
        }}
      >
        <Typography gutterBottom>{value?.title}</Typography>
        <Typography variant="body2">{value?.description}</Typography>
        {value?.details && (
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
            {value.details}
          </Alert>
        )}
        <Stack
          align="center"
          direction="row"
          justify="between"
          style={{ marginTop: 'auto' }}
        >
          <Typography variant="body2">
            Last check: {formattedLastCheck}
          </Typography>
          {/* Note that "Check now" feature only works with a real watcher instance and its functionality cannot be mocked now */}
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
        </Stack>
      </CardBody>
    </Card>
  );
};
