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
  DateTime,
  LabelGroup,
  Center,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types/dist/common';
import { getDecimalString, getNumberOfDecimals } from '@rosen-ui/utils';

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

export const Overview = ({
  details,
  loading: isLoading,
  error,
}: DetailsProps) => {
  return (
    <Section state="open" title="Overview">
      {error ? (
        <Center style={{ height: '380px' }}>{error}</Center>
      ) : (
        <>
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
              style={{ width: isLoading ? '100%' : 'auto' }}
              loading={isLoading}
              value={details?.eventId}
              copyable
            />
          </Label>
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
                name={details?.sourceToken?.name}
                reverse
                overrides={{
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
                value={getDecimalString(
                  // todo: empty string
                  details?.amount ? details.amount : '',
                  Number(details?.sourceToken?.decimals),
                )}
                orientation="horizontal"
                unit={details?.sourceToken?.symbol}
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
                timestamp={details?.timestamp && details.timestamp * 1000}
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
                style={{ width: isLoading ? '75%' : 'auto' }}
                loading={isLoading}
                value={details?.fromAddress}
                href={details?.fromAddress}
                copyable
              />
            </Label>
            <Label label="To" inset>
              <Identifier
                style={{ width: isLoading ? '75%' : 'auto' }}
                loading={isLoading}
                value={details?.toAddress}
                href={details?.fromAddress}
                copyable
              />
            </Label>
          </LabelGroup>
        </>
      )}
    </Section>
  );
};
