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
})(() => ({
  position: 'relative',
  flexGrow: 1,
  overflowY: 'auto',
}));

const Paper = styled('div', {
  name: 'RosenApp',
  slot: 'Paper',
  overridesResolver: (props, styles) => styles.main,
})(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  color: theme.palette.text.primary,
  transition: 'ease-in-out 100ms',
  [theme.breakpoints.down('tablet')]: {
    borderTopRightRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(12),
  },
}));

export interface AppProps {
  children: ReactNode;
  sidebar: ReactNode;
  theme: ThemeProviderProps['theme'];
}

export const App = ({ children, sidebar, theme }: AppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <SnackbarProvider>
          <Root>
            {sidebar}
            <Main>
              <Paper>
                {children}
              </Paper>
            </Main>
            <AppSnackbar />
          </Root>
        </SnackbarProvider>
      </>
    </ThemeProvider>
  );
};
