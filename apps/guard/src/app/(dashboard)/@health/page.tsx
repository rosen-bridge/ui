'use client';

import { useMemo } from 'react';

import {
  Box,
  Card,
  CardBody,
  Icon,
  IconProps,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/types/api';

const VARIANTS: Record<
  ApiInfoResponse['health']['status'],
  { 
    color: IconProps['color']; 
    darkColor: IconProps['color']; 
    lightColor: IconProps['color']; 
    status: string; 
    icon: IconProps['name']
  }
> = {
  Broken: {
    color: 'error',
    darkColor: 'error-dark',
    lightColor: 'error-light',
    status: 'BROKEN',
    icon: 'CloseCircle',
  },
  Healthy: {
    color: 'success',
    darkColor: 'success-dark',
    lightColor: 'success-light',
    status: 'OK',
    icon: 'ShieldCheck',
  },
  Unstable: {
    color: 'warning',
    darkColor: 'warning-dark',
    lightColor: 'warning-light',
    status: 'UNSTABLE',
    icon: 'ExclamationOctagon',
  },
} as const;

const Health = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);

  const isSmall = useBreakpoint('laptop-down');

  const status = useMemo(() => data?.health.status || 'Broken', [data]);

  const trialErrors = useMemo(
    () => data?.health.trialErrors.join('\n'),
    [data],
  );

  const variant = useMemo(() => VARIANTS[status], [status]);

  return (
    <Card
      backgroundColor={isLoading ? 'background-paper' : variant.lightColor}
      style={{ overflow: 'hidden' }}
    >
      <CardBody>
        <Stack
          align="center"
          spacing={1}
          direction={isSmall ? 'row' : 'column'}
          style={{ height: isSmall ? undefined : '230px' }}
        >
          {!isSmall && <Box flexGrow={1} />}

          {isLoading ? (
            <Skeleton variant="circular" width={32} height={32} />
          ) : (
            <Icon color={variant.color} name={variant.icon} size="32px" />
          )}

          <Typography color={variant.color} loading={isLoading}>
            Health is
          </Typography>

          <Typography color={variant.darkColor} loading={isLoading} variant="h3">
            {variant.status}
          </Typography>

          {isSmall && <Box flexGrow={1} />}

          <div
            style={{
              position: isSmall ? 'static' : 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 2,
            }}
          >
            {isLoading && (
              <Skeleton variant="circular" width={24} height={24} />
            )}
            {!isLoading && trialErrors && (
              <Tooltip title={trialErrors}>
                <Icon
                  color={variant.darkColor}
                  name="ExclamationTriangleFill"
                />
              </Tooltip>
            )}
          </div>
        </Stack>
      </CardBody>
      <div
        style={{
          zIndex: 1,
          position: 'absolute',
          top: isSmall ? '50%' : '-20%',
          right: isSmall ? '0' : '50%',
          transform: isSmall ? 'translate(0, -50%)' : 'translate(50%, 0)',
        }}
      >
        {isLoading ? (
          <Skeleton variant="circular" width={184} height={184} />
        ) : (
          <Icon
            color={variant.darkColor}
            name={variant.icon}
            opacity="0.2"
            size="184px"
          />
        )}
      </div>
    </Card>
  );
};

export default Health;
