'use client';

import { useRouter } from 'next/navigation';
import { Fragment, PropsWithChildren } from 'react';

import { Refresh } from '@rosen-bridge/icons';
import { IconButton, PageHeading, SvgIcon } from '@rosen-bridge/ui-kit';

const PageLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  return (
    <Fragment>
      <PageHeading
        title="Events"
        actions={
          <IconButton color="inherit" onClick={() => router.push('/reprocess')}>
            <SvgIcon>
              <Refresh />
            </SvgIcon>
          </IconButton>
        }
      />
      {children}
    </Fragment>
  );
};

export default PageLayout;
