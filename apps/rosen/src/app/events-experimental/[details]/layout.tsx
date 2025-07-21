'use client';

import { Fragment, PropsWithChildren } from 'react';

import { PageHeading } from '@rosen-bridge/ui-kit';

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <PageHeading title="Events Details" />
      {children}
    </Fragment>
  );
};

export default PageLayout;
