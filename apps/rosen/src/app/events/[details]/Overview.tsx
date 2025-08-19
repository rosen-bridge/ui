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
            <div key={i} style={{ margin: '8px' }}>
              <Skeleton variant="rectangular" height={100} width={100} />
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

  const renderLabel = (
    label: string,
    children: React.ReactNode,
    inset = false,
  ) => (
    <Label
      orientation={isMobile ? 'horizontal' : 'vertical'}
      label={label}
      inset={inset}
    >
      {children}
    </Label>
  );

  if (isLoading || !data) {
    return (
      <DetailsCard state="open" title="Overview">
        <SkeletonOverview />
      </DetailsCard>
    );
  }

  return (
    <DetailsCard state="open" title="Overview">
      {renderLabel(
        'Event Id',
        <Identifier
          value={data.eventTriggers?.eventId || 'error loading !!!'}
          copyable
        />,
      )}
      <Columns count={3} width="320px" gap="8px">
        {renderLabel(
          'Chin',
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
          </Stack>,
        )}

        {renderLabel(
          'Token',
          <Token name={data.sourceChainTokenId} reverse={isMobile} />,
        )}

        {renderLabel(
          'Time',
          <Typography color="text.primary" variant="body1">
            {time(data.timestamp || 175522841)}
          </Typography>,
        )}

        {renderLabel(
          'Amount',
          <Amount2 value={data.amount} orientation="horizontal" unit="N/A" />,
        )}

        {renderLabel(
          'Status',
          data.status === null ? (
            <>fraud</>
          ) : (
            <EventStatus value={data.status} />
          ),
        )}

        {renderLabel(
          'Fee Sum',
          <Amount2
            value={data.networkFee}
            orientation="horizontal"
            unit={data.sourceChainTokenId}
          />,
        )}
      </Columns>

      <div>
        <Label label="Address"></Label>
        <Label label="from" inset>
          <Identifier
            value={data.fromAddress || 'error loading !!!'}
            href={data.fromAddress}
            copyable
          />
        </Label>
        <Label label="to" inset>
          <Identifier
            value={data.toAddress || 'error loading !!!'}
            href={data.fromAddress}
            copyable
          />
        </Label>
      </div>
    </DetailsCard>
  );
};
