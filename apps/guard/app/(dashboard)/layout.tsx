'use client';

import { Fragment } from 'react';

import { Box, Grid, PageHeading } from '@rosen-bridge/ui-kit';
import { LayoutProps } from '@rosen-ui/types';

const DashboardLayout = ({
  actions,
  revenue,
  tokens,
  health,
  networks,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Dashboard" />
    <Grid container spacing={3}>
      <Grid item container spacing={2}>
        <Grid item laptop={2} tablet={12} mobile={12}>
          {health}
        </Grid>
        <Grid item laptop={10} tablet={12} mobile={12}>
          {networks}
        </Grid>
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
