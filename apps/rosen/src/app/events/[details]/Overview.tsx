'use client';

import React from 'react';

import {
  Amount2,
  Chip,
  Columns,
  Connector,
  Grid,
  GridContainer,
  Identifier,
  Label,
  Network,
  RelativeTime,
  Stack,
  Token,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';
import { ProgressStatus } from '@/app/events/[details]/ProgressStatus';

export const Overview = () => {
  const isMobile = useBreakpoint('tablet-down');
  return (
    <DetailsCard title="Overview">
      <Label
        orientation={isMobile ? 'horizontal' : 'vertical'}
        label="Event Id"
      >
        {/*TODO: Fix Identifier responsive */}
        <div
          style={{
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <Identifier
            value="20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab"
            copyable
          />
        </div>
      </Label>
      {/*Identifier*/}
      <Columns count={3} width="300px">
        <Label orientation={isMobile ? 'horizontal' : 'vertical'} label="Chin">
          <Stack alignItems="center">
            <Connector
              start={<Network name={'bitcoin'} />}
              end={<Network name={'ethereum'} />}
            />
          </Stack>
        </Label>
        <Label orientation={isMobile ? 'horizontal' : 'vertical'} label="Date">
          <RelativeTime timestamp={1754489360} />
        </Label>
        {/*Chip*/}
        <Label
          orientation={isMobile ? 'horizontal' : 'vertical'}
          label="Status"
        >
          <ProgressStatus state="inPaymentApproved" />
        </Label>
        <Label orientation={isMobile ? 'horizontal' : 'vertical'} label="Token">
          <Token name="PALM" />
        </Label>
        <Label
          orientation={isMobile ? 'horizontal' : 'vertical'}
          label="Amount"
        >
          <Amount2 value={2000000} orientation={'horizontal'} unit={'PALM'} />
        </Label>
        <Label
          orientation={isMobile ? 'horizontal' : 'vertical'}
          label="Fee Sum"
        >
          <Amount2
            value={10052.268809}
            orientation={'horizontal'}
            unit={'PALM'}
          />
        </Label>
      </Columns>

      <div>
        <Label label="Address"></Label>
        <Label label="from" inset>
          <Identifier
            value="addr1qyn20ad4h9hqdax8ftgcvzdwht93v6dz6004fv9zjlfn0ddt803hh8au69dq6qlzgkg8xceters0yurxhkzdax3ugueqdffypc"
            copyable
          />
        </Label>
        <Label label="to" inset>
          <Identifier
            value="20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab"
            copyable
          />
        </Label>
      </div>
    </DetailsCard>
  );
};
