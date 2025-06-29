'use client';

import { Fragment } from 'react';

import { Box, Grid, PageHeading } from '@rosen-bridge/ui-kit';
import { LayoutProps } from '@rosen-ui/types';

const DashboardLayout = ({
  actions,
  infoWidgets,
  revenue,
  tokens,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Dashboard" />
    <Grid container spacing={3}>
      <Grid item mobile={12} laptop={4}>
        {infoWidgets}
      </Grid>
      <Grid item mobile={12} laptop={8}>
        {revenue}
      </Grid>
      <Box mt={3} width="1">
        {actions}
      </Box>
    </Grid>
  </Fragment>
);

export default DashboardLayout;
