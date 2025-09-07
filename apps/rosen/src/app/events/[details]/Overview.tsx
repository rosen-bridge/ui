'use client';

import React from 'react';

import {
  Amount,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  Token,
  Chip,
  InjectOverrides,
  Box as BoxBase,
  DateTime,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types/dist/common';

import { Section } from './Section';
import { DetailsProps } from './type';

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

export const Overview = ({ details, loading: isLoading }: DetailsProps) => {
  const Box = InjectOverrides(BoxBase);

  return (
    <Section state="open" title="Overview">
      <Box
        overrides={{
          mobile: { style: { width: '100%' } },
          tablet: { style: { width: '90%' } },
          laptop: { style: { width: isLoading ? '100%' : 'fit-content' } },
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
          <Identifier
            overrides={{
              mobile: { style: { width: '90%' } },
              tablet: { style: { width: '100%' } },
            }}
            loading={isLoading}
            value={details?.eventId}
            copyable
          />
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
            name={details?.sourceChainTokenId}
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
          <Amount
            loading={isLoading}
            value={details?.amount}
            orientation="horizontal"
            unit="TODO"
          />
        </Label>
        <Label
          label="Chain"
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
                    name: details?.fromChain as NetworkType,
                  },
                  tablet: {
                    variant: 'both',
                    name: details?.fromChain as NetworkType,
                  },
                }}
                variant={'both'}
                name={details?.fromChain as NetworkType}
              />
            }
            end={
              <Network
                loading={isLoading}
                overrides={{
                  mobile: {
                    variant: 'logo',
                    name: details?.toChain as NetworkType,
                  },
                  tablet: {
                    variant: 'both',
                    name: details?.fromChain as NetworkType,
                  },
                }}
                variant={'both'}
                name={details?.toChain as NetworkType}
              />
            }
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
          <EventStatus value={details?.status} loading={isLoading} />
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
            timestamp={
              details?.block?.timestamp && details.block.timestamp * 1000
            }
          />
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
          <Amount loading={isLoading} value="TODO" unit={'TODO'} />
        </Label>
      </Columns>

      <Label label="Address"></Label>
      <Label
        overrides={{
          mobile: {
            style: { width: '100%', overflow: 'hidden' },
          },
          tablet: {
            style: { width: '70%' },
          },
        }}
        label="From"
        inset
      >
        <Identifier
          overrides={{
            mobile: {
              style: { width: '90%' },
            },
            tablet: {
              style: { width: '80%' },
            },
          }}
          loading={isLoading}
          value={details?.fromAddress}
          href={details?.fromAddress}
          copyable
        />
      </Label>

      <Label
        overrides={{
          mobile: {
            style: { width: '100%', overflow: 'hidden' },
          },
          tablet: {
            style: { width: '70%', overflow: 'hidden' },
          },
          laptop: {
            style: { width: '70%', overflow: 'hidden' },
          },
        }}
        label="To"
        inset
      >
        <Identifier
          overrides={{
            mobile: {
              style: { width: '90%' },
            },
            tablet: {
              style: { width: '80%' },
            },
          }}
          loading={isLoading}
          value={details?.toAddress}
          href={details?.fromAddress}
          copyable
        />
      </Label>
    </Section>
  );
};
