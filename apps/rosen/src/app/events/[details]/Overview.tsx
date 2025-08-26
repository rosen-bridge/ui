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
  const Stack = InjectOverrides(StackBase);
  const Box = InjectOverrides(BoxBase);

  const { data } = useSWR<EventDetails>(`/v1/events/${id}`, fetcher);
  const isLoading = true;
  useEffect(() => {
    console.log(data);
  }, [data, isLoading]);

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
            <Identifier
              loading={isLoading}
              value={data?.eventId || 'error loading !!!'}
              copyable
            />
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
          {!isLoading && data ? (
            <Token
              name={data.sourceChainTokenId}
              overrides={{
                mobile: {
                  reverse: true,
                },
                tablet: {
                  reverse: false,
                },
              }}
            />
          ) : (
            <Stack
              overrides={{
                mobile: { flexDirection: 'row-reverse' },
                tablet: { flexDirection: 'row' },
              }}
              alignItems="center"
              flexDirection="row"
              gap={1}
            >
              <Skeleton width={32} height={32} variant="circular" />
              <Skeleton width={80} height={14} variant="rounded" />
            </Stack>
          )}
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
          {!isLoading && data ? (
            <Amount2 value={data.amount} orientation="horizontal" unit="N/A" />
          ) : (
            <Amount2 loading />
          )}
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
          {!isLoading && data ? (
            <DateTime timestamp={data.block?.timestamp * 1000 || 175522841} />
          ) : (
            <Skeleton width={80} height={14} variant="rounded" />
          )}
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
            {!isLoading && data ? (
              <Identifier
                value={data.fromAddress || 'error loading !!!'}
                href={data.fromAddress}
                copyable
              />
            ) : (
              <Identifier value={''} loading />
            )}
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
