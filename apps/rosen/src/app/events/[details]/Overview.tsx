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
  LabelGroup,
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

const Box = InjectOverrides(BoxBase);

export const Overview = ({ details, loading: isLoading }: DetailsProps) => {
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
          orientation="horizontal"
          overrides={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Identifier
            overrides={{
              mobile: { style: { width: '100%' } },
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
          orientation="horizontal"
          overrides={{
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
          orientation="horizontal"
          overrides={{
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
          orientation="horizontal"
          overrides={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Connector
            start={
              <Network
                loading={isLoading}
                variant={'logo'}
                name={details?.fromChain as NetworkType}
                overrides={{
                  tablet: {
                    variant: 'both',
                    name: details?.fromChain as NetworkType,
                  },
                }}
              />
            }
            end={
              <Network
                loading={isLoading}
                variant={'logo'}
                name={details?.toChain as NetworkType}
                overrides={{
                  tablet: {
                    variant: 'both',
                    name: details?.fromChain as NetworkType,
                  },
                }}
              />
            }
          />
        </Label>
        <Label
          label="Status"
          orientation="horizontal"
          overrides={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <EventStatus value={details?.status} loading={isLoading} />
        </Label>
        <Label
          label="Time"
          orientation="horizontal"
          overrides={{
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
          orientation="horizontal"
          overrides={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Amount loading={isLoading} value="TODO" unit={'TODO'} />
        </Label>
      </Columns>

      <Label label="Address"></Label>
      <LabelGroup
        overrides={{
          tablet: {
            style: { width: '70%' },
          },
        }}
      >
        <Label label="From" inset>
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
        <Label label="To" inset>
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
      </LabelGroup>
    </Section>
  );
};
