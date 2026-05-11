'use client';

import { Fragment, ReactNode } from 'react';

import {
  PageHeading,
  Stack,
  StackProps,
  useResponsive,
} from '@rosen-bridge/ui-kit';

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
}: LayoutProps) => {
  const props = useResponsive<StackProps>({
    mobile: {
      direction: 'column',
      // align: 'TODO',
    },
    laptop: {
      direction: 'row',
      align: 'center',
    },
  });

  const minWidth = useResponsive({
    mobile: '100%',
    laptop: '200px',
  });

  return (
    <Fragment>
      <PageHeading title="Dashboard" />
      <Stack spacing={3}>
        <Stack
          spacing={2}
          style={{
            flexShrink: 0,
          }}
          {...props}
        >
          <Stack style={{ minWidth }}>{health}</Stack>
          <div style={{ minWidth: 0, flexGrow: 1 }}>{networks}</div>
        </Stack>
        {revenue}
        {actions}
        {tokens}
      </Stack>
    </Fragment>
  );
};

export default Layout;
