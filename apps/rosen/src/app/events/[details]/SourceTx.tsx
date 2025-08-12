'use client'

import { Box, Card2, Card2Body } from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

export const SourceTx = () => {
  const data = {
    to: 'binance',
    bridgeFee: '10000000000',
    networkFee: '52268809',
    toAddress: '0xba085e2bc3023c7b191605189fab20bb4cd5387b',
    fromAddress: [
      'addr1qyn20ad4h9hqdax8ftgcvzdwht93v6dz6004fv9zjlfn0ddt803hh8au69d',
      'q6qlzgkg8xceters0yurxhkzdax3ugueqdffypc',
    ],
  };
  return (
    <DetailsCard title="Source tx metadata">
      <Card2 backgroundColor="primary.light">
        <Card2Body>{JSON.stringify(data, null, 2)}</Card2Body>
      </Card2>
    </DetailsCard>
  );
};
