'use client';

import React from 'react';

import {
  Amount2,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  RelativeTime,
  Stack,
  Token,
  useBreakpoint,
  Skeleton,
  Chip,
  Typography,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]';
import { BridgeEvent } from '@/app/events/[details]/type';

type EventStatusProps = {
  value: 'fraud' | 'processing' | 'successful' | undefined;
};

const SkeletonOverview = () => {
  return (
    <div>
      <Stack flexDirection="column" gap={2}>
        <Skeleton width="100%" height="30px" />
        <Columns width={'320px'} gap={'16px'} count={3}>
          {Array.from(Array(6).keys()).map((_, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <Skeleton variant="rounded" height={100} width={'100%'} />
            </div>
          ))}
        </Columns>
      </Stack>
    </div>
  );
};

const EventStatus = ({ value }: EventStatusProps) => {
  switch (value) {
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

  const { data, isLoading } = useSWR<BridgeEvent>(`/v1/events/${id}`, fetcher);

  const orientation = isMobile ? 'horizontal' : 'vertical';

  function time(timestamp: number) {
    const date = new Date(timestamp);

    const formatted = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);

    return formatted.replace(',', '');
  }

  if (isLoading || !data) {
    return (
      <DetailsCard state="open" title="Overview">
        <SkeletonOverview />
      </DetailsCard>
    );
  }

  return (
    <DetailsCard state="open" title="Overview">
      <div style={{ width: '70%' }}>
        <Label label="Event Id">
          <Identifier
            value={data.eventTriggers?.eventId || 'error loading !!!'}
            copyable
          />
        </Label>
      </div>
      <Columns count={3} width="320px" gap="24px">
        <Label orientation={orientation} label="Chin">
          <Stack alignItems="center">
            <Connector
              start={
                <Network
                  variant={isMobile ? 'logo' : 'both'}
                  name={data.fromChain}
                />
              }
              end={
                <Network
                  variant={isMobile ? 'logo' : 'both'}
                  name={data.toChain}
                />
              }
            />
          </Stack>
        </Label>

        <Label label="Token" orientation={orientation}>
          <Token name={data.sourceChainTokenId} reverse={isMobile} />
        </Label>

        <Label label="Time" orientation={orientation}>
          <Typography color="text.primary" variant="body1">
            {time(data.timestamp || 175522841)}
          </Typography>
        </Label>

        <Label label="Amount" orientation={orientation}>
          <Amount2 value={data.amount} orientation="horizontal" unit="N/A" />
        </Label>

        <Label label="Status" orientation={orientation}>
          {data.status === undefined ? (
            <Typography>fraud</Typography>
          ) : (
            <EventStatus value={data.status} />
          )}
        </Label>

        <Label label="Fee Sum" orientation={orientation}>
          <Amount2
            value={data.networkFee}
            orientation="horizontal"
            unit={data.sourceChainTokenId}
          />
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
              overflow: 'hidden',
              marginLeft: isMobile ? '10px' : '60px',
            }}
          >
            <Identifier
              value={data.fromAddress || 'error loading !!!'}
              href={data.fromAddress}
              copyable
            />
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
              overflow: 'hidden',
              marginLeft: isMobile ? '10px' : '60px',
            }}
          >
            <Identifier
              value={data.toAddress || 'error loading !!!'}
              href={data.fromAddress}
              copyable
            />
          </div>
        </Stack>
      </Stack>
    </DetailsCard>
  );
};
