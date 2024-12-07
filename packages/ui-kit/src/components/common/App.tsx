import { ReactNode } from 'react';

import { SnackbarProvider } from '../../contexts';
import { ThemeProvider, ThemeProviderProps } from '../../Providers';
import { styled } from '../../styling';
import { CssBaseline } from '../base';
import { AppSnackbar } from './AppSnackbar';

const Root = styled('div', {
  name: 'RosenApp',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
  },
}));

const Main = styled('div', {
  name: 'RosenApp',
  slot: 'Main',
  overridesResolver: (props, styles) => styles.main,
})(({ theme }) => ({
  position: 'relative',
  flexGrow: 1,
  overflowY: 'auto',
  backgroundColor: theme.palette.background.default,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  [theme.breakpoints.down('tablet')]: {
    borderTopRightRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(12),
  },
}));

interface AppProps {
  children: ReactNode;
  sideBar: ReactNode;
  theme: ThemeProviderProps['theme'];
  toolbar: ReactNode;
}

export const App = ({ children, sideBar, theme, toolbar }: AppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <SnackbarProvider>
          <Root>
            {sideBar}
            <Main>
              <div style={{ position: 'relative', zIndex: '1' }}>{toolbar}</div>
              {children}
            </Main>
            <AppSnackbar />
          </Root>
        </SnackbarProvider>
      </>
    </ThemeProvider>
  );
};
