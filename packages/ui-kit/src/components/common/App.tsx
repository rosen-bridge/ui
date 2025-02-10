import { ReactNode } from 'react';

import { SnackbarProvider } from '../../contexts';
import { useMediaQuery } from '../../hooks';
import { ThemeProvider, ThemeProviderProps } from '../../Providers';
import { styled } from '../../styling';
import { Box, CssBaseline } from '../base';
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

export interface AppProps {
  children: ReactNode;
  sideBar: ReactNode;
  theme: ThemeProviderProps['theme'];
  toolbar: ReactNode;
}

export const App = ({ children, sideBar, theme, toolbar }: AppProps) => {
  const isMobile = useMediaQuery(
    ('light' in theme ? theme.light : theme).breakpoints.down('tablet'),
  );
  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <SnackbarProvider>
          <Root>
            {isMobile ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                {sideBar}
                {toolbar}
              </Box>
            ) : (
              sideBar
            )}
            <Main>
              {!isMobile && (
                <div style={{ position: 'relative', zIndex: '1' }}>
                  {toolbar}
                </div>
              )}
              {children}
            </Main>
            <AppSnackbar />
          </Root>
        </SnackbarProvider>
      </>
    </ThemeProvider>
  );
};
