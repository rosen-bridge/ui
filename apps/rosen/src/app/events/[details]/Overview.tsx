'use client';

import React, { useEffect, useRef } from 'react';

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
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';
import { BridgeEvent } from '@/app/events/[details]/type';

type EventStatusProps = {
  value: 'fraud' | 'processing' | 'successful' | undefined;
};

const SkeletonOverview = () => {
  return <div style={{ width: '100%', minHeight: '339px' }}>loading....</div>;
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
  const { data, isLoading, error } = useSWR<BridgeEvent>(
    `/v1/events/${id}`,
    fetcher,
  );
  // useEffect(() => {
  //   console.log(data);
  // }, [data, isLoading, error]);

  return (
    <DetailsCard state="open" title="Overview">
      {isLoading ? (
        <SkeletonOverview />
      ) : (
        <>
          <Label
            orientation={isMobile ? 'horizontal' : 'vertical'}
            label="Event Id"
          >
            {data && (
              <Identifier
                value={data?.eventTriggers?.eventId || 'error loading !!!'}
                copyable
              />
            )}
          </Label>
          {/*Identifier*/}
          <Columns count={3} width="320px" gap="8px">
            <Label
              orientation={isMobile ? 'horizontal' : 'vertical'}
              label="Chin"
            >
              <Stack alignItems="center">
                {data && (
                  <Connector
                    start={
                      <Network
                        variant={isMobile ? 'logo' : 'both'}
                        loading={isLoading}
                        name={data?.fromChain}
                      />
                    }
                    end={
                      <Network
                        variant={isMobile ? 'logo' : 'both'}
                        loading={isLoading}
                        name={data?.toChain}
                      />
                    }
                  />
                )}
              </Stack>
            </Label>

            <Label
              orientation={isMobile ? 'horizontal' : 'vertical'}
              label="Token"
            >
              {/*TODO: diff type sourceChainTokenId*/}
              <Token name={data?.sourceChainTokenId} reverse={isMobile} />
            </Label>

            <Label
              orientation={isMobile ? 'horizontal' : 'vertical'}
              label="Time"
            >
              {data && <RelativeTime timestamp={data?.timestamp || 1755841} />}
            </Label>

            {/*Chip*/}
            <Label
              orientation={isMobile ? 'horizontal' : 'vertical'}
              label="Amount"
            >
              {/*TODO: amount to usd */}
              <Amount2
                value={data?.amount}
                orientation={'horizontal'}
                unit={'N/A'}
              />
            </Label>

            <Label
              orientation={isMobile ? 'horizontal' : 'vertical'}
              label="Status"
            >
              {data?.status === null ? (
                <>fraud</>
              ) : (
                <EventStatus value={data?.status} />
              )}
            </Label>
            <Label
              orientation={isMobile ? 'horizontal' : 'vertical'}
              label="Fee Sum"
            >
              {/*TODO: diff type sourceChainTokenId*/}
              <Amount2
                value={data?.networkFee}
                orientation={'horizontal'}
                unit={data?.sourceChainTokenId}
              />
            </Label>
          </Columns>

          <div>
            <Label label="Address"></Label>
            <Label label="from" inset>
              <Identifier
                loading={isLoading}
                value={data?.fromAddress || 'error loading !!!'}
                copyable
              />
            </Label>
            <Label label="to" inset>
              <Identifier
                loading={isLoading}
                value={data?.toAddress || 'error loading !!!'}
                copyable
              />
            </Label>
          </div>
        </>
      )}
    </DetailsCard>
  );
};
