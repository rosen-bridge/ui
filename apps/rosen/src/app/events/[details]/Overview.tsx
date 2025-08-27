'use client';

import React, { useEffect } from 'react';

import {
  Amount2,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  Stack as StackBase,
  Token,
  Skeleton,
  Chip,
  InjectOverrides,
  Box as BoxBase,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network as NetworkType } from '@rosen-ui/types/dist/common';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]';
import { DateTime } from '@/app/events/[details]/DateTime';
import { EventDetails } from '@/app/events/[details]/type';

export interface EventStatusProps {
  value?: string;
  loading?: boolean;
}

export const EventStatus = ({ value, loading }: EventStatusProps) => {
  if (loading) {
    return <Chip loading />;
  }

  if (!value) {
    return <span>invalid</span>;
  }

  switch (value.toLowerCase()) {
    case 'fraud':
      return null;

    case 'processing':
      return <Chip label={value} color="info" icon="Hourglass" />;

    case 'successful':
      return <Chip label={value} color="success" icon="CheckCircle" />;

    default:
      return <span>{value}</span>;
  }
};

export const Overview = ({ id }: { id: string }) => {
  const Stack = InjectOverrides(StackBase);
  const Box = InjectOverrides(BoxBase);

  const { data, isLoading } = useSWR<EventDetails>(`/v1/events/${id}`, fetcher);

  return (
    <DetailsCard state="open" title="Overview">
      <Box
        overrides={{
          mobile: { style: { width: '100%' } },
          tablet: { style: { width: '70%' } },
        }}
      >
        <Label
          label="Event Id"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <div style={{ width: '100%' }}>
            <Identifier loading={isLoading} value={data?.eventId} copyable />
          </div>
        </Label>
      </Box>

      <Columns count={3} width="320px" gap="24px">
        <Label
          label="Token"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Token
            loading={isLoading}
            name={data?.sourceChainTokenId}
            overrides={{
              mobile: {
                reverse: true,
              },
              tablet: {
                reverse: false,
              },
            }}
          />
        </Label>

        <Label
          label="Amount"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Amount2
            loading={isLoading}
            value={data?.amount}
            orientation="horizontal"
            unit="TODO"
          />
        </Label>

        <Label
          label="Chin"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Connector
            start={
              <Network
                loading={isLoading}
                overrides={{
                  mobile: {
                    variant: 'logo',
                    name: data?.fromChain as NetworkType,
                  },
                  tablet: {
                    variant: 'both',
                    name: data?.fromChain as NetworkType,
                  },
                }}
                variant={'both'}
                name={data?.fromChain as NetworkType}
              />
            }
            end={
              <Network
                loading={isLoading}
                overrides={{
                  mobile: {
                    variant: 'logo',
                    name: data?.toChain as NetworkType,
                  },
                  tablet: {
                    variant: 'both',
                    name: data?.toChain as NetworkType,
                  },
                }}
                variant={'both'}
                name={data?.toChain as NetworkType}
              />
            }
          />
        </Label>

        <Label
          label="Time"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <DateTime
            loading={isLoading}
            timestamp={data?.block?.timestamp && data.block.timestamp * 1000}
          />
        </Label>

        <Label
          label="Status"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <EventStatus value={data?.status} loading={isLoading} />
        </Label>

        <Label
          label="Fee Sum"
          orientation="vertical"
          overrides={{
            mobile: {
              orientation: 'horizontal',
            },
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
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
          overrides={{
            mobile: {
              style: { width: '100%' },
            },
            tablet: {
              style: { width: '70%' },
            },
          }}
        >
          <Label label="from" inset></Label>
          <Box
            overrides={{
              mobile: {
                style: {
                  maxWidth: '568px',
                  width: '100%',
                  overflow: 'hidden',
                  marginLeft: '10px',
                },
              },
              tablet: {
                style: {
                  maxWidth: '568px',
                  width: '100%',
                  overflow: 'hidden',
                  marginLeft: '60px',
                },
              },
            }}
          >
            <Identifier
              loading={isLoading}
              value={data?.fromAddress}
              href={data?.fromAddress}
              copyable
            />
          </Box>
        </Stack>
        <Stack
          flexDirection={'row'}
          alignItems="center"
          justifyContent="space-between"
          overrides={{
            mobile: {
              style: { width: '100%' },
            },
            tablet: {
              style: { width: '70%' },
              alignItems: 'center',
            },
          }}
        >
          <Label label="to" inset></Label>
          <Box
            overrides={{
              mobile: {
                style: {
                  alignItems: 'center',
                  maxWidth: '568px',
                  width: '100%',
                  overflow: 'hidden',
                  marginLeft: '10px',
                },
              },
              tablet: {
                style: {
                  alignItems: 'center',
                  maxWidth: '568px',
                  width: '100%',
                  overflow: 'hidden',
                  marginLeft: '60px',
                },
              },
            }}
          >
            <Identifier
              loading={isLoading}
              value={data?.toAddress}
              href={data?.fromAddress}
              copyable
            />
          </Box>
        </Stack>
      </Stack>
    </DetailsCard>
  );
};
