'use client';

import { Fragment } from 'react';

import { Grid, PageHeading } from '@rosen-bridge/ui-kit';
import { LayoutProps } from '@rosen-ui/types';

const HomeLayout = ({
  actions,
  address,
  infoWidgets,
  revenue,
  tokens,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Home" />
    <Grid container spacing={{ mobile: 1, tablet: 3 }}>
      <Grid item mobile={12}>
        {infoWidgets}
      </Grid>
      <Grid item container direction="column" mobile={12} tablet={6}>
        <Grid item>{actions}</Grid>
        <Grid item>{revenue}</Grid>
      </Grid>
      <Grid item mobile={12} tablet={6}>
        {tokens}
      </Grid>
      <Grid item mobile={12}>
        {address}
      </Grid>
    </Grid>
  </Fragment>
);

export default HomeLayout;
