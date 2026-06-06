'use client';

import { Fragment } from 'react';

import {
  Button,
  CubeNetBackground,
  NotFound as NotFoundComponent,
  Stack,
} from '@rosen-bridge/ui-kit';

const NotFound = () => {
  return (
    <Fragment>
      <CubeNetBackground
        style={{ position: 'absolute', inset: 0, zIndex: -1 }}
      />
      <Stack
        align="center"
        direction="column"
        justify="center"
        spacing={6}
        style={{ height: '100vh' }}
      >
        <NotFoundComponent />
        <Button href="/" variant="contained">
          Go Home
        </Button>
      </Stack>
    </Fragment>
  );
};

export default NotFound;
