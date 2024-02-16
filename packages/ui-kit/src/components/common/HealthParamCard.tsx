import moment from 'moment';
import { useMemo } from 'react';

import { ShieldCheck, ShieldExclamation } from '@rosen-bridge/icons';
import { HealthParamInfo } from '@rosen-ui/types';

import { FullCard } from '.';
import { useTheme } from '../../hooks';
import { Button, SvgIcon, Typography } from '../base';

export type HealthParamCardProps = HealthParamInfo & {
  handleCheckNow: () => void;
};
/**
 * render a healt param card to be used in health page
 *
 * @param id
 * @param status
 * @param description
 * @param lastCheck
 * @param handleCheckNow
 */
export const HealthParamCard = ({
  id,
  status,
  description,
  lastCheck,
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

  return (
    <FullCard
      backgroundColor={`${color}.${theme.palette.mode}`}
      headerProps={{
        title: status,
        avatar: (
          <SvgIcon>
            {status === 'Healthy' ? <ShieldCheck /> : <ShieldExclamation />}
          </SvgIcon>
        ),
        sx: {
          color: `${color}.${
            theme.palette.mode === 'light' ? 'dark' : 'light'
          }`,
          '& span': { color: 'inherit' },
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
            size="small"
            sx={{ fontSize: 'inherit' }}
            onClick={handleCheckNow}
            color={color}
          >
            Check now
          </Button>
          (Last check: {moment(lastCheck).format('DD/MM/YYYY HH:mm:ss')})
        </Typography>
      }
    >
      <Typography gutterBottom>{id}</Typography>
      <Typography variant="body2">{description}</Typography>
    </FullCard>
  );
};
