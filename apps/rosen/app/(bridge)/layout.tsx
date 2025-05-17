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

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <PageHeading title="Rosen Bridge" />
      {children}
      <Background>
        <CubeNetSvg color="primary" className="top" />
        <CubeNetSvg color="secondary" className="bottom" />
      </Background>
    </Fragment>
  );
};

export default PageLayout;
