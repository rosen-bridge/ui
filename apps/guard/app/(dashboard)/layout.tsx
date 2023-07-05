'use client';

import { Grid } from '@rosen-bridge/ui-kit';
import { LayoutProps } from '@rosen-ui/types';

const DashboardLayout = ({
  actions,
  infoWidgets,
  revenue,
  tokens,
}: LayoutProps) => (
  <Grid container spacing={3}>
    <Grid item mobile={12} laptop={4}>
      {infoWidgets}
    </Grid>
    <Grid item mobile={12} laptop={8}>
      {revenue}
    </Grid>
    <Grid item mobile={12}>
      {actions}
    </Grid>
    {tokens}
  </Grid>
);

export default DashboardLayout;
