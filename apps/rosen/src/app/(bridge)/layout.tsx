'use client';

import { Fragment, PropsWithChildren } from 'react';

import { CubeNetBackground, PageHeading, styled } from '@rosen-bridge/ui-kit';

const Main = styled('main')(({ theme }) => ({
  'position': 'relative',
  'display': 'grid',
  'gridTemplateRows': 'auto',
  'gridTemplateColumns': 'minmax(0, 1fr)',
  'gap': theme.spacing(2),
  'alignContent': 'center',
  'marginInline': 'auto',
  'minHeight': 'calc(100vh - 224px)',
  'maxWidth': '1048px',
  [theme.breakpoints.up('laptop')]: {
    'gridTemplateColumns': '2fr minmax(320px, 1fr)',
    'gap': theme.spacing(3),
    '& .alert': {
      gridColumn: '1/-1',
    },
  },
  '& :is(.form,.info)': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  '& .action': {
    [theme.breakpoints.up('tablet')]: {
      justifySelf: 'center',
      width: '50%',
    },
    [theme.breakpoints.up('laptop')]: {
      gridColumn: '1/-1',
      width: '33%',
      paddingRight: theme.spacing(2),
    },
  },
  [theme.breakpoints.up('tablet')]: {
    zIndex: 1,
  },
}));

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
      <Main>{children}</Main>
    </Fragment>
  );
};

export default PageLayout;
