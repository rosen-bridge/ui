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
  Skeleton,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/';
import { EventDetails } from '@/app/events/[details]/type';

export const Details = ({ id }: { id: string }) => {
  const { data, isLoading } = useSWR<EventDetails>(`/v1/events/${id}`, fetcher);

  const Box = InjectOverrides(BoxMui);

  const disclosure = useDisclosure();

  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Details"
    >
      <Columns width="350px" count={3} rule gap="24px">
        <div>
          <Label orientation="horizontal" label="Duration">
            <RelativeTime
              isLoading={isLoading}
              timestamp={data?.block.timestamp}
            />
          </Label>

          <Label label="Total Emission">
            {!isLoading ? (
              <Typography>TODO</Typography>
            ) : (
              <Skeleton
                width={80}
                style={{ fontSize: 'inherit' }}
                variant="text"
              />
            )}
          </Label>
          <Label label="Guards" inset>
            {!isLoading ? (
              <Typography>TODO</Typography>
            ) : (
              <Skeleton
                width={80}
                style={{ fontSize: 'inherit' }}
                variant="text"
              />
            )}
          </Label>
          <Label label="Watchers" inset>
            {!isLoading ? (
              <Typography>TODO</Typography>
            ) : (
              <Skeleton
                width={80}
                style={{ fontSize: 'inherit' }}
                variant="text"
              />
            )}
          </Label>
          <Label label="RSN Ratio">
            {!isLoading ? (
              <Typography>TODO</Typography>
            ) : (
              <Skeleton
                width={80}
                style={{ fontSize: 'inherit' }}
                variant="text"
              />
            )}
          </Label>
        </div>

        <div>
          <Label label="Token Price">
            {!isLoading ? (
              <Typography>TODO</Typography>
            ) : (
              <Skeleton
                width={80}
                style={{ fontSize: 'inherit' }}
                variant="text"
              />
            )}
          </Label>
          <Label label="Fee Sum">
            {' '}
            {!isLoading ? (
              <Typography>TODO</Typography>
            ) : (
              <Skeleton
                width={80}
                style={{ fontSize: 'inherit' }}
                variant="text"
              />
            )}
          </Label>
          <Label label="Bridge Fee" inset>
            <Amount
              loading={isLoading}
              value={data?.bridgeFee}
              unit={isLoading ? '' : 'TODO'}
            />
          </Label>
          <Label label="Network Fee" inset>
            <Amount
              loading={isLoading}
              value={data?.networkFee}
              unit={isLoading ? '' : 'TODO'}
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
            <div style={{ width: '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.sourceTxId ?? 'N/A'}
                copyable
                qrcode
              />
            </div>
          </Label>
          <Label label="Payment Tx" inset>
            <div style={{ width: '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.eventTrigger?.paymentTxId ?? undefined}
                copyable
                qrcode
              />
            </div>
          </Label>
          <Label label="Reward Tx" inset>
            <div style={{ width: '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.eventTrigger?.spendTxId ?? undefined}
                copyable
                qrcode
              />
            </div>
          </Label>
          <Label label="Trigger Tx" inset>
            <div style={{ width: '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.eventTrigger?.txId}
                copyable
                qrcode
              />
            </div>
          </Label>
        </Box>
      </Columns>
    </DetailsCard>
  );
};
