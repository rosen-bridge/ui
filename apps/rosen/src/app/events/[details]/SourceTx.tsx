'use client';

import React, { useState } from 'react';

import {
  Box,
  Card,
  CardBody,
  CopyButton,
  DisclosureButton,
  Skeleton,
  Stack,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/';
import { EventDetails } from '@/app/events/[details]/type';

export const SourceTx = ({ id }: { id: string }) => {
  const { data, isLoading } = useSWR<EventDetails>(`/v1/events/${id}`, fetcher);

  const disclosure = useDisclosure();

  const metaData = {
    to: data?.toChain,
    bridgeFee: data?.bridgeFee,
    networkFee: data?.networkFee,
    toAddress: data?.toAddress,
    fromAddress: data?.toAddress,
  };

  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Source tx metadata"
    >
      {!isLoading && data ? (
        <Card backgroundColor="primary.light">
          <CardBody>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: 10 }}>
                <CopyButton value={JSON.stringify(metaData)} />
              </div>
              <pre style={{ paddingTop: '16px', overflow: 'hidden' }}>
                {JSON.stringify(metaData, null, 3)}
              </pre>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Skeleton
          variant="rounded"
          width="100%"
          height="210px"
          sx={{ display: 'block' }}
        />
      )}
    </DetailsCard>
  );
};
