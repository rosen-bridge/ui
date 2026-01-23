'use client';

import { Fragment, ReactNode } from 'react';

import { Box, PageHeading, Stack } from '@rosen-bridge/ui-kit';

type LayoutProps = {
  actions: ReactNode;
  address: ReactNode;
  infoWidgets: ReactNode;
  revenue: ReactNode;
  tokens: ReactNode;
};

const Layout = ({
  actions,
  address,
  infoWidgets,
  revenue,
  tokens,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Home" />
    <Stack spacing={2}>
      {infoWidgets}
      <Box
        style={{
          display: 'grid',
          gap: '16px',
        }}
        overrides={{
          mobile: {
            gridTemplateColumns: '1fr',
          },
          laptop: {
            gridTemplateColumns: '1fr 1fr',
          },
        }}
      >
        {revenue}
        {tokens}
        {actions}
        {address}
      </Box>
    </Stack>
  </Fragment>
);

export default Layout;
