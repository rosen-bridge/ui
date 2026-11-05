'use client';

import { Fragment, type PropsWithChildren } from 'react';

import { PageHeading } from '@rosen-bridge/ui-kit';

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <PageHeading title="Frequently Asked Questions" />
      {children}
    </Fragment>
  );
};

export default PageLayout;
