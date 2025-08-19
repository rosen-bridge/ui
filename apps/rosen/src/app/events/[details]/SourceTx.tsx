'use client';

import React from 'react';

import {
  Box,
  Card2,
  Card2Body,
  Card2Header,
  DisclosureButton,
  Stack,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/';

export const SourceTx = () => {
  const disclosure = useDisclosure({
    onOpen: () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve();
          } else {
            reject();
          }
        }, 500);
      });
    },
  });
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
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Source tx metadata"
    >
      <Card2 backgroundColor="primary.light">
        <Card2Body>
          {/*TODO: Check pt of card2*/}
          <div style={{ paddingTop: '16px', overflow: 'hidden' }}>
            {JSON.stringify(data, null, 3)}
          </div>
        </Card2Body>
      </Card2>
    </DetailsCard>
  );
};
