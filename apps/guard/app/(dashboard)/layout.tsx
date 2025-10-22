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
          <Box
            sx={(theme) => ({
              [theme.breakpoints.up('laptop')]: {
                minWidth: '200px',
              },
            })}
          >
            {health}
          </Box>
          <Box minWidth={0}>{networks}</Box>
        </Stack>
      </Grid>
      <Grid item mobile={12} laptop={12}>
        {revenue}
      </Grid>
      <Box mt={3} width="1">
        {actions}
      </Box>
      {tokens}
    </Grid>
  </Fragment>
);

export default DashboardLayout;
