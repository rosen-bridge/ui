'use client';

import { Fragment, ReactNode } from 'react';

import { PageHeading, Stack } from '@rosen-bridge/ui-kit';

type LayoutProps = {
  actions: ReactNode;
  revenue: ReactNode;
  health: ReactNode;
  networks: ReactNode;
  tokens: ReactNode;
};

const Layout = ({
  actions,
  revenue,
  health,
  networks,
  tokens,
}: LayoutProps) => (
  <Fragment>
    <PageHeading title="Dashboard" />
    <Stack spacing={3}>
      <Stack
        spacing={2}
        direction="column"
        style={{
          flexShrink: 0,
        }}
        rewrite={{
          laptop: {
            direction: 'row',
            align: 'center',
          },
        }}
      >
        <Stack
          style={{ width: '100%' }}
          rewrite={{
            laptop: {
              style: { minWidth: '200px' },
            },
          }}
        >
          {health}
        </Stack>
        <div style={{ minWidth: 0, flexGrow: 1 }}>{networks}</div>
      </Stack>
      {revenue}
      {actions}
      {tokens}
    </Stack>
  </Fragment>
);

export default Layout;
