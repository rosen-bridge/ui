'use client';

import React from 'react';

import {
  Amount,
  Box as BoxMui,
  Columns,
  DisclosureButton,
  Identifier,
  InjectOverrides,
  Label,
  RelativeTime,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

import { Section } from './Section';
import { DetailsProps } from './type';

const Box = InjectOverrides(BoxMui);

export const Details = ({ details, loading: isLoading }: DetailsProps) => {
  const disclosure = useDisclosure();

  return (
    <Section
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Details"
    >
      <Columns width="350px" count={3} rule gap="24px">
        <div>
          <Label orientation="horizontal" label="Duration">
            <RelativeTime
              isLoading={isLoading}
              timestamp={details?.block.timestamp}
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
          overrides={{
            laptop: {
              style: {
                columnSpan: 'all',
              },
            },
            desktop: {
              style: {
                columnSpan: 'none',
              },
            },
          }}
        >
          <Label label="Tx IDs" />
          <Label label="Source Tx" inset>
            <Identifier
              style={{ width: '80%' }}
              loading={isLoading}
              value={details?.sourceTxId ?? 'N/A'}
              copyable
              qrcode
            />
          </Label>
          <Label label="Payment Tx" inset>
            <Identifier
              style={{ width: '80%' }}
              loading={isLoading}
              value={details?.eventTrigger?.paymentTxId ?? undefined}
              copyable
              qrcode
            />
          </Label>
          <Label label="Reward Tx" inset>
            <Identifier
              style={{ width: '80%' }}
              loading={isLoading}
              value={details?.eventTrigger?.spendTxId ?? undefined}
              copyable
              qrcode
            />
          </Label>
          <Label label="Trigger Tx" inset>
            <Identifier
              style={{ width: '80%' }}
              loading={isLoading}
              value={details?.eventTrigger?.txId}
              copyable
              qrcode
            />
          </Label>
        </Box>
      </Columns>
    </Section>
  );
};
