'use client';

import { Fragment, PropsWithChildren } from 'react';

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <PageHeading title="Details" />
      {children}
    </Fragment>
  );
};

export default PageLayout;
