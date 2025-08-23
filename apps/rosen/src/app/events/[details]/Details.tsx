'use client';

import React from 'react';

import {
  Amount2,
  Columns,
  DisclosureButton,
  Grid,
  Identifier,
  Label,
  RelativeTime,
  Skeleton,
  Stack,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/';
import { BridgeEvent } from '@/app/events/[details]/type';

export const Details = ({ id }: { id: string }) => {
  const { data, isLoading, mutate } = useSWR<BridgeEvent>(
    `/v1/events/${id}`,
    fetcher,
  );

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
            {data?.timestamp ? (
              <RelativeTime timestamp={data.timestamp} />
            ) : (
              <Typography>N/A</Typography>
            )}
          </Label>
          <Label label="Fee Sum">
            <Amount2 value={10052} unit="PALM" />
          </Label>
          <Label label="Bridge Fee" inset>
            <Amount2 value={10052} unit="PALM" />
          </Label>
          <Label label="Network Fee" inset>
            <Amount2 value={10052} unit="PALM" />
          </Label>
          <Label label="Token Price">
            <Amount2 value={0.22} unit="$" />
          </Label>
        </div>

        <div>
          <Label label="RSN Ratio">
            <Amount2 value={2.054} />
          </Label>
          <Label label="Total Emission" />
          <Label label="Guards" inset>
            <Typography>N/A</Typography>
          </Label>
          <Label label="Watchers" inset>
            <Typography>N/A</Typography>
          </Label>
        </div>

        <div>
          <Label label="Tx IDs" />
          <Label label="Source Tx" inset>
            <Identifier value={data?.sourceTxId ?? 'N/A'} copyable />
          </Label>
          <Label label="Payment Tx" inset>
            {data?.paymentTxId ? (
              <Identifier value={data.paymentTxId} copyable />
            ) : (
              <>N/A</>
            )}
          </Label>
          <Label label="Reward Tx" inset>
            N/A
          </Label>
          <Label label="Trigger Tx" inset>
            N/A
          </Label>
        </div>
      </Columns>
    </DetailsCard>
  );
};
