import React from 'react';

import {
  Amount2,
  Columns,
  Grid,
  Identifier,
  Label,
  RelativeTime,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

export const Details = () => {
  return (
    <DetailsCard title="Details">
      <Stack flexDirection="column" gap={1}>
        <Grid container columns={3}>
          {/*Date*/}
          <Grid item mobile={3} tablet={1}>
            <Label orientation="vertical" label="Date">
              <RelativeTime timestamp={1754489360} />
            </Label>
          </Grid>
          {/*Triggered by Z watchers*/}
          <Grid item mobile={3} tablet={1}>
            <Label orientation="vertical" label="Triggered by Z watchers">
              <Typography>66</Typography>
            </Label>
          </Grid>
        </Grid>
        <Grid container columns={3} spacing={3}>
          <Grid item mobile={3} tablet={3} laptop={1} desktop={1}>
            <Label label="Fees"></Label>
            <Label label="Bridge Fee" inset>
              <Amount2 value={10000} />
            </Label>
            <Label label="Network Fee" inset>
              <Amount2 value={52.268809} />
            </Label>
            <Label label="Lock Tx" inset>
              <Amount2 value={10000} />
            </Label>
            <Label label="Payment Tx" inset>
              <Amount2 value={10000} />
            </Label>
          </Grid>
          <Grid item mobile={3} tablet={3} laptop={2} desktop={2}>
            <Label label="Tx IDs"></Label>
            <Label label="Source Tx" inset>
              <Identifier
                value="addr1qyn20ad4h9hqdax8ftgcvzdwht93v6dz6004fv9zjlfn0ddt803hh8au69dq6qlzgkg8xceters0yurxhkzdax3ugueqdffypc"
                copyable
              />
            </Label>
            <Label label="Payment Tx" inset>
              <Identifier
                value="20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab"
                copyable
              />
            </Label>
            <Label label="Reward Tx" inset>
              <Identifier
                value="addr1qyn20ad4h9hqdax8ftgcvzdwht93v6dz6004fv9zjlfn0ddt803hh8au69dq6qlzgkg8xceters0yurxhkzdax3ugueqdffypc"
                copyable
              />
            </Label>
            <Label label="Trigger Tx" inset>
              <Identifier
                value="20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab"
                copyable
              />
            </Label>
          </Grid>
        </Grid>
      </Stack>
    </DetailsCard>
  );
};
