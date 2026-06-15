'use client';

import { Fragment } from 'react';

import {
  CubeNetBackground,
  Stack,
  UnderDevelopment,
} from '@rosen-bridge/ui-kit';

const Dashboard = () => (
  <Fragment>
    <CubeNetBackground style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
    <Stack
      align="center"
      direction="column"
      justify="center"
      spacing={6}
      style={{
        zIndex: 10,
        minHeight: 'calc(100vh - 224px)',
        position: 'relative',
      }}
    >
      <UnderDevelopment />
    </Stack>
  </Fragment>
);

export default Dashboard;
