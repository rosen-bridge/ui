'use client';

import React from 'react';

import {
  Amount2,
  Box as BoxMui,
  Columns,
  DisclosureButton,
  Identifier,
  InjectOverrides,
  Label,
  RelativeTime,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/';
import { EventDetails } from '@/app/events/[details]/type';

export const Details = ({ id }: { id: string }) => {
  const { data, isLoading, mutate } = useSWR<EventDetails>(
    `/v1/events/${id}`,
    fetcher,
  );
  const Box = InjectOverrides(BoxMui);

  const disclosure = useDisclosure({
    onOpen: async () => {
      await mutate();
    },
  });

  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={'open'}
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
          <Label label="Fee Sum">TODO</Label>
          <Label label="Bridge Fee" inset>
            <Amount2 loading={isLoading} value={data?.bridgeFee} unit="TODO" />
          </Label>
          <Label label="Network Fee" inset>
            <Amount2 loading={isLoading} value={data?.networkFee} unit="TODO" />
          </Label>
          <Label label="Token Price">
            TODO
            {/*<Amount2 value={0.22} unit="$" />*/}
          </Label>
        </div>

        <div>
          <Label label="RSN Ratio">
            TODO
            {/*<Amount2 value={2.054} />*/}
          </Label>
          <Label label="Total Emission" />
          <Label label="Guards" inset>
            <Typography>TODO</Typography>
          </Label>
          <Label label="Watchers" inset>
            <Typography>TODO</Typography>
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
            <div style={{ width: isLoading ? '40%' : '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.sourceTxId ?? 'N/A'}
                copyable
              />
            </div>
          </Label>
          <Label label="Payment Tx" inset>
            <div style={{ width: isLoading ? '40%' : '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.eventTrigger?.paymentTxId ?? undefined}
                copyable
              />
            </div>
          </Label>
          <Label label="Reward Tx" inset>
            <div style={{ width: isLoading ? '40%' : '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.eventTrigger?.spendTxId ?? undefined}
                copyable
              />
            </div>
          </Label>
          <Label label="Trigger Tx" inset>
            <div style={{ width: isLoading ? '40%' : '80%' }}>
              <Identifier
                loading={isLoading}
                value={data?.eventTrigger?.txId}
                copyable
              />
            </div>
          </Label>
        </Box>
      </Columns>
    </DetailsCard>
  );
};
