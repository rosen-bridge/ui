'use client';

import { Fragment, PropsWithChildren } from 'react';

import { PageHeading, styled } from '@rosen-bridge/ui-kit';

import { CubeNetSvg } from './CubeNet';

const Background = styled('div')(({ theme }) => ({
  'position': 'absolute',
  'inset': 0,
  'backgroundImage':
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg,${theme.palette.primary.light},${theme.palette.background.default},${theme.palette.background.default},${theme.palette.secondary.light})`
      : 'none',
  'zIndex': '0',
  '& > svg': {
    'position': 'absolute',
    'width': '100%',
    'zIndex': '-1',
    'left': 0,
    '&.top': {
      top: 0,
    },
    '&.bottom': {
      bottom: 0,
      transform: 'rotate(180deg)',
    },
  },
  [theme.breakpoints.down('tablet')]: {
    display: 'none',
  },
}));

const Main = styled('main')(({ theme }) => ({
  'position': 'relative',
  'display': 'grid',
  'gridTemplateRows': 'auto',
  'gridTemplateColumns': '1fr',
  'gap': theme.spacing(2),
  'alignContent': 'center',
  'marginInline': 'auto',
  'minHeight': 'calc(100vh - 224px)',
  'maxWidth': theme.breakpoints.values.laptop,
  [theme.breakpoints.up('laptop')]: {
    'gridTemplateColumns': '2fr 1fr',
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
      <PageHeading title="Rosen Bridge" />
      <Main>{children}</Main>
      <Background>
        <CubeNetSvg color="primary" className="top" />
        <CubeNetSvg color="secondary" className="bottom" />
      </Background>
    </Fragment>
  );
};

export default PageLayout;
