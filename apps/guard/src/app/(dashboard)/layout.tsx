'use client';

import { Fragment, ReactNode } from 'react';

import { Box, Grid, PageHeading, Stack } from '@rosen-bridge/ui-kit';

type LayoutProps = {
  actions: ReactNode;
  revenue: ReactNode;
  health: ReactNode;
  networks: ReactNode;
  tokens: ReactNode;
};

const Layout = ({
  actions,
  revenue,
  health,
  networks,
  tokens,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Dashboard" />
    <Grid container spacing={3}>
      <Grid size={{ mobile: 12 }}>
        <Stack
          spacing={2}
          direction="column"
          style={{
            flexShrink: 0,
          }}
          overrides={{
            laptop: {
              direction: 'row',
              align: 'center',
            },
          }}
        >
          <Stack
            style={{ width: '100%' }}
            overrides={{
              laptop: {
                style: { minWidth: '200px' },
              },
            }}
          >
            {health}
          </Stack>
          <div style={{ minWidth: 0, flexGrow: 1 }}>{networks}</div>
        </Stack>
      </Grid>
      <Grid size={12}>{revenue}</Grid>
      <Box mt={3} width="1">
        {actions}
      </Box>
      {tokens}
    </Grid>
  </Fragment>
);

export default Layout;
