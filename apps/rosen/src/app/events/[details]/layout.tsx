'use client';

import { Fragment, PropsWithChildren } from 'react';

import { PageHeading } from '@rosen-bridge/ui-kit';
import { Actions } from '../../Actions';

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <PageHeading title="Details" actions={<Actions />} />
      {children}
    </Fragment>
  );
};

export default PageLayout;
