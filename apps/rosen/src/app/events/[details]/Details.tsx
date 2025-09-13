'use client';

import React from 'react';

import {
  Amount,
  Box,
  Center,
  Columns,
  Identifier,
  Label,
  LabelGroup,
  RelativeTime,
} from '@rosen-bridge/ui-kit';

import { Section } from './Section';
import { DetailsProps } from './type';

export const Details = ({
  details,
  loading: isLoading,
  error,
}: DetailsProps) => {
  return (
    <Section title="Details">
      {error ? (
        <Center style={{ height: '380px' }}>{error}</Center>
      ) : (
        <>
          <Columns width="300px" count={3} rule gap="24px">
            <div>
              <Label orientation="horizontal" label="Duration">
                <RelativeTime
                  isLoading={isLoading}
                  timestamp={details?.timestamp}
                />
              </Label>
              <Label label="Total Emission">
                <Amount loading={isLoading} value="TODO" unit={'TODO'} />
              </Label>
              <Label label="Guards" inset>
                <Amount loading={isLoading} value="TODO" unit={'TODO'} />
              </Label>
              <Label label="Watchers" inset>
                <Amount loading={isLoading} value="TODO" unit={'TODO'} />
              </Label>
              <Label label="RSN Ratio">
                <Amount loading={isLoading} value="TODO" unit={'TODO'} />
              </Label>
            </div>
            <div>
              <Label label="Token Price">
                <Amount loading={isLoading} value="TODO" unit={'TODO'} />
              </Label>
              <Label label="Fee Sum">
                <Amount loading={isLoading} value="TODO" unit={'TODO'} />
              </Label>
              <Label label="Bridge Fee" inset>
                <Amount
                  loading={isLoading}
                  value={details?.bridgeFee}
                  unit={'TODO'}
                />
              </Label>
              <Label label="Network Fee" inset>
                <Amount
                  loading={isLoading}
                  value={details?.networkFee}
                  unit={'TODO'}
                />
              </Label>
            </div>
            <Box
              style={{
                columnSpan: 'all',
              }}
              overrides={{
                desktop: {
                  style: {
                    columnSpan: 'none',
                  },
                },
              }}
            >
              <Label label="Tx IDs" />
              <LabelGroup>
                <Label label="Source Tx" inset>
                  <Identifier
                    style={{ width: '90%' }}
                    loading={isLoading}
                    value={details?.sourceTxId ?? 'N/A'}
                    href={'todo'}
                    copyable
                  />
                </Label>
                <Label label="Payment Tx" inset>
                  <Identifier
                    style={{ width: '90%' }}
                    loading={isLoading}
                    value={details?.paymentTxId ?? undefined}
                    href={'todo'}
                    copyable
                  />
                </Label>
                <Label label="Reward Tx" inset>
                  <Identifier
                    style={{ width: '90%' }}
                    loading={isLoading}
                    value={details?.spendTxId ?? undefined}
                    href={'todo'}
                    copyable
                  />
                </Label>
                <Label label="Trigger Tx" inset>
                  <Identifier
                    style={{ width: '90%' }}
                    loading={isLoading}
                    value={details?.triggerTxId}
                    href={'todo'}
                    copyable
                  />
                </Label>
              </LabelGroup>
            </Box>
          </Columns>
        </>
      )}
    </Section>
  );
};
