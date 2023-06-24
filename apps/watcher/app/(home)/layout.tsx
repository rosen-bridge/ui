'use client';

import { Grid } from '@rosen-bridge/ui-kit';

import { LayoutProps } from '@/_types';

const HomeLayout = ({ infoWidgets, tokens }: LayoutProps) => (
  <Grid container spacing={{ mobile: 1, tablet: 3 }}>
    <Grid item mobile={12}>
      {infoWidgets}
    </Grid>
    <Grid item container mobile={12} tablet={6}>
      <Grid item>
        {/**
         * TODO: actions element comes here
         * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/9
         */}
      </Grid>
      <Grid item>
        {/**
         * TODO: revenues element comes here
         * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/9
         */}
      </Grid>
    </Grid>
    <Grid item mobile={12} tablet={6}>
      {tokens}
    </Grid>
    <Grid item mobile={12}>
      {/**
       * TODO: address element comes here
       * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/9
       */}
    </Grid>
  </Grid>
);

export default HomeLayout;
