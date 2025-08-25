'use client';

import React from 'react';

import {
  Amount2,
  Columns,
  DisclosureButton,
  Identifier,
  Label,
  RelativeTime,
  Skeleton,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/';
import { BridgeEvent, EventDetails } from '@/app/events/[details]/type';

export const Details = ({ id }: { id: string }) => {
  const { data, isLoading, mutate } = useSWR<EventDetails>(
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
      state={disclosure.state}
      title="Details"
    >
      <Columns width="350px" count={3} rule gap="24px">
        <div>
          <Label orientation="horizontal" label="Duration">
            {data?.block.timestamp ? (
              <RelativeTime timestamp={data.block.timestamp} />
            ) : (
              <Skeleton
                variant="rectangular"
                style={{ width: '100%', borderRadius: '4px' }}
                height={'14px'}
              />
            )}
          </Label>
          <Label label="Fee Sum">TODO</Label>
          <Label label="Bridge Fee" inset>
            <Amount2 value={data?.bridgeFee} unit="TODO" />
          </Label>
          <Label label="Network Fee" inset>
            <Amount2 value={data?.networkFee} unit="TODO" />
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

        <div>
          <Label label="Tx IDs" />
          <Label label="Source Tx" inset>
            <Identifier value={data?.sourceTxId ?? 'N/A'} copyable />
          </Label>
          <Label label="Payment Tx" inset>
            {data?.eventTrigger?.paymentTxId ? (
              <Identifier value={data?.eventTrigger?.paymentTxId} copyable />
            ) : (
              <>TODO</>
            )}
          </Label>
          <Label label="Reward Tx" inset>
            {data?.eventTrigger?.spendTxId ? (
              <Identifier value={data?.eventTrigger?.spendTxId} copyable />
            ) : (
              <>TODO</>
            )}
          </Label>
          <Label label="Trigger Tx" inset>
            {data?.eventTrigger?.txId ? (
              <Identifier value={data?.eventTrigger?.txId} copyable />
            ) : (
              <>TODO</>
            )}
          </Label>
        </div>
      </Columns>
    </DetailsCard>
  );
};
