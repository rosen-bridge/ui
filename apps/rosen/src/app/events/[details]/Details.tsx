'use client';

import React from 'react';

import {
  Amount2,
  Columns,
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

const SkeletonDetails = () => {
  return (
    <div>
      <Stack flexDirection="column" gap={2}>
        <Skeleton width="100%" height="30px" />
        <Columns width={'320px'} gap={'16px'} count={3}>
          {Array.from(Array(6).keys()).map((_, i) => (
            <div key={i} style={{ margin: '8px' }}>
              <Skeleton variant="rectangular" height={100} width={100} />
            </div>
          ))}
        </Columns>
      </Stack>
    </div>
  );
};

export const Details = ({ id }: { id: string }) => {
  const { data, isLoading } = useSWR<BridgeEvent>(`/v1/events/${id}`, fetcher);

  if (isLoading || !data) {
    return (
      <DetailsCard state="open" title="Details">
        <SkeletonDetails />
      </DetailsCard>
    );
  }

  return (
    <DetailsCard state="open" title="Details">
      {isLoading ? (
        <SkeletonDetails />
      ) : (
        <Stack flexDirection="column" gap={2}>
          <Columns width="230px" count={3} gap="8px">
            <Label orientation="vertical" label="Duration">
              {data?.timestamp ? (
                <RelativeTime timestamp={data.timestamp} />
              ) : (
                <Typography>N/A</Typography>
              )}
            </Label>
            <Label orientation="vertical" label="Token Price">
              <Typography>N/A</Typography>
            </Label>
            <Label orientation="vertical" label="RSN Ratio">
              <Typography>N/A</Typography>
            </Label>
          </Columns>

          <Columns width="500px" count={2} gap="24px">
            <div>
              <Label label="Total Emission" />
              <Label label="Guards" inset>
                <Typography>N/A</Typography>
              </Label>
              <Label label="Watchers" inset>
                <Typography>N/A</Typography>
              </Label>
            </div>
            <div>
              <Label label="Fee Sum" />
              <Label label="Bridge Fee" inset>
                <Typography>N/A</Typography>
              </Label>
              <Label label="Network Fee" inset>
                <Typography>N/A</Typography>
              </Label>
            </div>
          </Columns>

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
        </Stack>
      )}
    </DetailsCard>
  );
};
