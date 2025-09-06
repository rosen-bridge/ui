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
import { DetailsProps, EventDetails } from '@/app/events/[details]/type';

export const SourceTx = ({ details, loading: isLoading }: DetailsProps) => {
  const disclosure = useDisclosure();

  const metaData = {
    to: details?.toChain,
    bridgeFee: details?.bridgeFee,
    networkFee: details?.networkFee,
    toAddress: details?.toAddress,
    fromAddress: details?.toAddress,
  };

  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Source tx metadetails"
    >
      {!isLoading && details ? (
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
