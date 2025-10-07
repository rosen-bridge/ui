'use client';

import { useMemo } from 'react';

import {
  CloseCircle,
  ExclamationOctagon,
  ExclamationTriangleFill,
  ShieldCheck,
} from '@rosen-bridge/icons';
import {
  Box,
  Card,
  CardBody,
  Skeleton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/_types/api';

const VARIANTS = {
  broken: {
    color: 'error',
    status: 'BROKEN',
    Icon: CloseCircle,
  },
  healthy: {
    color: 'success',
    status: 'OK',
    Icon: ShieldCheck,
  },
  unstable: {
    color: 'warning',
    status: 'UNSTABLE',
    Icon: ExclamationOctagon,
  },
} as const;

type StatusType = keyof typeof VARIANTS;

const Health = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);

  const isSmall = useBreakpoint('laptop-down');

  const status = useMemo(
    () => (data?.health.status.toLowerCase() || 'broken') as StatusType,
    [data],
  );

  const trialErrors = useMemo(
    () => data?.health.trialErrors.join('\n'),
    [data],
  );

  const variant = useMemo(() => VARIANTS[status], [status]);

  return (
    <Card
      backgroundColor={
        isLoading ? 'background.paper' : `${variant.color}.light`
      }
      style={{ overflow: 'hidden' }}
    >
      <CardBody>
        <Stack
          alignItems="center"
          gap={1}
          flexDirection={isSmall ? 'row' : 'column'}
          height={isSmall ? undefined : '230px'}
        >
          {!isSmall && <Box flexGrow={1} />}

          {isLoading ? (
            <Skeleton variant="circular" width={32} height={32} />
          ) : (
            <SvgIcon size="32px" color={variant.color}>
              <variant.Icon />
            </SvgIcon>
          )}

          {isLoading ? (
            <Skeleton variant="text" width={80} height={24} />
          ) : (
            <Typography color={`${variant.color}.main`}>Health is</Typography>
          )}

          {isLoading ? (
            <Skeleton variant="text" width={60} height={32} />
          ) : (
            <Typography color={`${variant.color}.dark`} variant="h3">
              {variant.status}
            </Typography>
          )}

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
                <SvgIcon color={`${variant.color}.dark`}>
                  <ExclamationTriangleFill />
                </SvgIcon>
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
          <SvgIcon size={'184px'} opacity="0.2" color={`${variant.color}.dark`}>
            <variant.Icon />
          </SvgIcon>
        )}
      </div>
    </Card>
  );
};

export default Health;
