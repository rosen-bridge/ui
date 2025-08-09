import React from 'react';

import {
  Amount2,
  Chip,
  Connector,
  Grid,
  GridContainer,
  Identifier,
  Label,
  Network,
  RelativeTime,
  Stack,
  Token,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

export const Overview = () => {
  return (
    <DetailsCard title="Overview">
      <Label orientation="vertical" label="Event Id">
        {/*TODO: Fix Identifier responsive */}
        <div
          style={{
            flexGrow: 1,
            width: '100%',
            maxWidth: 'calc(100% - 100px)',
          }}
        >
          <Identifier
            value="20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab"
            copyable
          />
        </div>
      </Label>
      {/*Identifier*/}
      <GridContainer minWidth="250px" gap={1}>
        <Label orientation="vertical" label="Chin">
          <Connector
            start={<Network name={'bitcoin'} />}
            end={<Network name={'ethereum'} />}
          />
        </Label>
        <Label orientation="vertical" label="Date">
          <RelativeTime timestamp={1754489360} />
        </Label>
        {/*Chip*/}
        <Label orientation="vertical" label="Event Id">
          <Chip label="In Payment / Approved" color="info" />
        </Label>
        <Label orientation="vertical" label="Token">
          <Token name="PALM" />
        </Label>
        <Label orientation="vertical" label="Amount">
          <Amount2 value={2000000} orientation={'horizontal'} unit={'PALM'} />
        </Label>
        <Label orientation="vertical" label="Fee Sum">
          <Amount2
            value={10052.268809}
            orientation={'horizontal'}
            unit={'PALM'}
          />
        </Label>
      </GridContainer>

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
