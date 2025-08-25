'use client';

import React, { useEffect } from 'react';

import {
  Amount2,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  Stack,
  Token,
  useBreakpoint,
  Skeleton,
  Chip,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network as NetworkType } from '@rosen-ui/types/dist/common';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]';
import { DateTime } from '@/app/events/[details]/DateTime';
import { EventDetails, EventStatusProps } from '@/app/events/[details]/type';

const EventStatus = ({ value }: { value: string }) => {
  switch (value?.toLowerCase()) {
    case 'fraud':
      return null;
    case 'processing':
      return <Chip label={value} color="info" icon="Hourglass" />;
    case 'successful':
      return <Chip label={value} color="success" icon="CheckCircle" />;
    default:
      return null;
  }
};

export const Overview = ({ id }: { id: string }) => {
  const isMobile = useBreakpoint('tablet-down');

  const { data, isLoading } = useSWR<EventDetails>(`/v1/events/${id}`, fetcher);

  const orientation = isMobile ? 'horizontal' : 'vertical';

  useEffect(() => {
    console.log(data);
  }, [data, isLoading]);

  return (
    <DetailsCard state="open" title="Overview">
      <div style={{ width: isMobile ? '100%' : '70%' }}>
        {!isLoading && data ? (
          <Label label="Event Id" orientation={orientation}>
            <Identifier value={data.eventId || 'error loading !!!'} copyable />
          </Label>
        ) : (
          <Stack>
            <Label orientation="horizontal" label="Event Id">
              {/*TODO: fix */}
              {isMobile && (
                <Skeleton
                  variant="rectangular"
                  style={{ width: '100%', borderRadius: '4px' }}
                  height={'14px'}
                />
              )}
            </Label>
            {/*TODO: fix */}
            {!isMobile && (
              <Skeleton
                variant="rectangular"
                style={{ width: '100%', borderRadius: '4px' }}
                height={'14px'}
              />
            )}
          </Stack>
        )}
      </div>
      <Columns count={3} width="320px" gap="24px">
        <Label label="Token" orientation={orientation}>
          {!isLoading && data ? (
            <Token name={data.targetChainTokenId} reverse={isMobile} />
          ) : (
            <Stack alignItems="center" flexDirection="row" gap={1}>
              <Skeleton width={32} height={32} variant="circular" />
              <Skeleton width={80} height={14} variant="rounded" />
            </Stack>
          )}
        </Label>

        <Label label="Amount" orientation={orientation}>
          {!isLoading && data ? (
            <Amount2 value={data.amount} orientation="horizontal" unit="N/A" />
          ) : (
            <Amount2 loading />
          )}
        </Label>

        <Label label="Chin" orientation={orientation}>
          <Stack alignItems="center">
            {!isLoading && data ? (
              <Connector
                start={
                  <Network
                    variant={isMobile ? 'logo' : 'both'}
                    name={data.fromChain as NetworkType}
                  />
                }
                end={
                  <Network
                    variant={isMobile ? 'logo' : 'both'}
                    name={data.toChain as NetworkType}
                  />
                }
              />
            ) : (
              <Connector
                start={
                  <Network
                    loading
                    variant={isMobile ? 'logo' : 'both'}
                    name={'ergo'}
                  />
                }
                end={
                  <Network
                    loading
                    variant={isMobile ? 'logo' : 'both'}
                    name={'ergo'}
                  />
                }
              />
            )}
          </Stack>
        </Label>

        <Label label="Time" orientation={orientation}>
          {!isLoading && data ? (
            <DateTime timestamp={data.block?.timestamp * 1000 || 175522841} />
          ) : (
            <Skeleton width={80} height={14} variant="rounded" />
          )}
        </Label>

        <Label label="Status" orientation={orientation}>
          {!isLoading && data ? (
            <>
              {data.status ? (
                <EventStatus value={data.status} />
              ) : (
                <EventStatus value={'successful'} />
              )}
            </>
          ) : (
            <Skeleton width={180} height={32} variant="rounded" />
          )}
        </Label>

        <Label label="Fee Sum" orientation={orientation}>
          {!isLoading && data ? (
            <>TODO</>
          ) : (
            <Skeleton width={80} height={14} variant="rounded" />
          )}
        </Label>
      </Columns>

      <Stack>
        <Label label="Address"></Label>
        <Stack
          flexDirection={'row'}
          justifyContent="space-between"
          style={{ width: isMobile ? '100%' : '70%' }}
        >
          <Label label="from" inset></Label>
          <div
            style={{
              maxWidth: '568px',
              width: '100%',
              overflow: 'hidden',
              marginLeft: isMobile ? '10px' : '60px',
            }}
          >
            {!isLoading && data ? (
              <Identifier
                value={data.fromAddress || 'error loading !!!'}
                href={data.fromAddress}
                copyable
              />
            ) : (
              <Identifier value={''} loading />
            )}
          </div>
        </Stack>
        <Stack
          flexDirection={'row'}
          justifyContent="space-between"
          style={{ width: isMobile ? '100%' : '70%' }}
        >
          <Label label="to" inset></Label>
          <div
            style={{
              maxWidth: '568px',
              width: '100%',
              overflow: 'hidden',
              marginLeft: isMobile ? '10px' : '60px',
            }}
          >
            {!isLoading && data ? (
              <Identifier
                value={data.toAddress || 'error loading !!!'}
                href={data.fromAddress}
                copyable
              />
            ) : (
              <Identifier value={''} loading />
            )}
          </div>
        </Stack>
      </Stack>
    </DetailsCard>
  );
};
