'use client';

import { Fragment, type ReactNode } from 'react';

import { Box, PageHeading, Stack, useResponsive } from '@rosen-bridge/ui-kit';

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
}: LayoutProps) => {
  const gridTemplateColumns = useResponsive({
    mobile: '1fr',
    laptop: '1fr 1fr',
  });

  return (
    <Fragment>
      <PageHeading title="Home" />
      <Stack spacing={2}>
        {infoWidgets}
        <Box
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns,
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
};

export default Layout;
