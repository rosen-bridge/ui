'use client';

import React from 'react';
import { NoSsr } from '@mui/material';

import { styled, SnackbarProvider, AppSnackbar } from '@rosen-bridge/ui-kit';
import SWRConfig from '@rosen-ui/swr-mock';

import SideBar from './SideBar';
import Toolbar from './Toolbar';

import ThemeProvider from '@/_theme/ThemeProvider';

import { ApiKeyContextProvider } from './_contexts/apiKeyContext';

import mockedData from './_mock/mockedData';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.info.dark,
  backgroundImage:
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)`
      : 'none',
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
    backgroundImage:
      theme.palette.mode === 'light'
        ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)`
        : 'none',
  },
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  minHeight: '100%',
  backgroundColor: theme.palette.background.default,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  paddingTop: theme.shape.borderRadius,
  paddingBottom: theme.shape.borderRadius * 4,
  paddingLeft: theme.shape.borderRadius * 2,
  paddingRight: theme.shape.borderRadius * 2,

  [theme.breakpoints.down('tablet')]: {
    backgroundColor: theme.palette.background.paper,
    borderTopRightRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

interface AppProps {
  children?: React.ReactNode;
}

const App = ({ children }: AppProps) => {
  return (
    <NoSsr>
      <ThemeProvider>
        <SnackbarProvider>
          <ApiKeyContextProvider>
            <Root>
              <SideBar />
              <SWRConfig useMockedApis={true} fakeData={mockedData}>
                <Main>
                  <Toolbar />
                  {children}
                  <AppSnackbar />
                </Main>
              </SWRConfig>
            </Root>
          </ApiKeyContextProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </NoSsr>
  );
};

export default App;
