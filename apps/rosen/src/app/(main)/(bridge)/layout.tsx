'use client';

import { Fragment, type PropsWithChildren } from 'react';

import { CubeNetBackground, PageHeading } from '@rosen-bridge/ui-kit';

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <CubeNetBackground
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      <PageHeading
        title="Rosen Bridge"
        style={{ position: 'relative', zIndex: 1 }}
      />
      {children}
    </Fragment>
  );
};

export default PageLayout;
