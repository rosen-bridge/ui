'use client';

import { Fragment } from 'react';

import { Box, Grid, PageHeading, Stack } from '@rosen-bridge/ui-kit';
import { LayoutProps } from '@rosen-ui/types';

const DashboardLayout = ({
  actions,
  revenue,
  health,
  networks,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Dashboard" />
    <Grid container spacing={3}>
      <Grid item mobile={12}>
        <Stack
          spacing={2}
          direction="column"
          style={{
            flexShrink: 0,
          }}
          overrides={{
            laptop: {
              direction: 'row',
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
          <div style={{ minWidth: 0 }}>{networks}</div>
        </Stack>
      </Grid>
      <Grid item mobile={12} laptop={12}>
        {revenue}
      </Grid>
      <Box mt={3} width="1">
        {actions}
      </Box>
    </Grid>
  </Fragment>
);

export default DashboardLayout;
