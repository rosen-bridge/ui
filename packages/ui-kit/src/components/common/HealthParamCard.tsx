import { useMemo } from 'react';

import {
  ExclamationTriangle,
  ShieldCheck,
  ShieldExclamation,
  ShieldQuestion,
} from '@rosen-bridge/icons';
import { HealthParamInfo } from '@rosen-ui/types';
import moment from 'moment';

import { FullCard, SvgIcon } from '.';
import { useTheme } from '../../hooks';
import { Alert, Tooltip, Typography } from '../base';
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
        cardColor: `${color}.dark`,
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

  const Icon = useMemo(() => {
    if (!lastCheck) return ShieldQuestion;
    if (status === 'Healthy') return ShieldCheck;
    return ShieldExclamation;
  }, [lastCheck, status]);

  return (
    <FullCard
      backgroundColor={colors.cardBackground}
      headerProps={{
        title: (
          <>
            {lastCheck ? status : 'Unknown'}
            {lastTrialErrorTime && (
              <Tooltip title={lastTrialErrorMessage}>
                <SvgIcon color="warning">
                  <ExclamationTriangle />
                </SvgIcon>
              </Tooltip>
            )}
          </>
        ),
        avatar: (
          <SvgIcon>
            <Icon />
          </SvgIcon>
        ),
        sx: {
          'color': colors.cardColor,
          '& span': {
            color: 'inherit',
            display: 'flex',
            justifyContent: 'space-between',
          },
        },
      }}
      contentProps={{
        sx: { flexGrow: 1, pt: 0, pb: 1 },
      }}
      cardActions={
        <Typography variant="body2">
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
          {lastCheck &&
            `(Last check: ${moment(lastCheck).format('DD/MM/YYYY HH:mm:ss')})`}
        </Typography>
      }
    >
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
    </FullCard>
  );
};
