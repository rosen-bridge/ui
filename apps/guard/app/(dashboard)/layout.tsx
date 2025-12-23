'use client';

import { Fragment } from 'react';

import { Box, Grid, PageHeading, Stack } from '@rosen-bridge/ui-kit';
import { LayoutProps } from '@rosen-ui/types';

const DashboardLayout = ({
  actions,
  revenue,
  health,
  networks,
  tokens,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Dashboard" />
    <Grid container spacing={3}>
      <Grid size={{ mobile: 12 }} style={{ overflow: 'hidden', minWidth: 0 }}>
        <Stack
          spacing={2}
          direction="column"
          style={{
            flexShrink: 0,
            width: 'inherit',
          }}
          overrides={{
            laptop: {
              direction: 'row',
              align: 'center',
              style: { overflow: 'hidden' },
            },
          }}
        >
          <Stack
            style={{ width: '100%', minWidth: 0 }}
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
      <Grid size={12}>{revenue}</Grid>
      <Box mt={3} width="1">
        {actions}
      </Box>
      {tokens}
    </Grid>
  </Fragment>
);

export default DashboardLayout;
