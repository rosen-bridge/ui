'use client';

import { Fragment, PropsWithChildren } from 'react';

import { PageHeading } from '@rosen-bridge/ui-kit';

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <PageHeading title="History" />
      {children}
    </Fragment>
  );
};

export default PageLayout;
