import { ReactNode, useEffect, useRef, useState } from 'react';

import { SnackbarProvider } from '../../contexts';
import { useMediaQuery } from '../../hooks';
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

interface MobileHeaderProps {
  isShrunk: boolean;
}

const MobileHeader = styled('div', {
  name: 'RosenMobileHeader',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<MobileHeaderProps>(({ theme, isShrunk }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: isShrunk ? theme.spacing(1, 2) : theme.spacing(2),
  transition: 'ease-in-out 100ms',
}));

interface MainComponentProps {
  isShrunk: boolean;
}

const Main = styled('div', {
  name: 'RosenApp',
  slot: 'Main',
  overridesResolver: (props, styles) => styles.main,
})<MainComponentProps>(({ theme, isShrunk }) => ({
  position: 'relative',
  flexGrow: 1,
  overflowY: 'auto',
  backgroundColor: theme.palette.background.default,
  borderTopLeftRadius: isShrunk ? 0 : theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  transition: 'ease-in-out 100ms',
  [theme.breakpoints.down('tablet')]: {
    borderTopRightRadius: isShrunk ? 0 : theme.shape.borderRadius * 2,
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
  const main = useRef<HTMLDivElement>(null);
  const [isShrunk, setShrunk] = useState<boolean>(false);
  const isMobile = useMediaQuery(
    ('light' in theme ? theme.light : theme).breakpoints.down('tablet'),
  );
  useEffect(() => {
    const element = main.current;
    const handler = () => {
      setShrunk((isShrunk) => {
        if (!isShrunk && element && element.scrollTop > 20) {
          return true;
        }
        if (isShrunk && element && element.scrollTop < 4) {
          return false;
        }
        return isShrunk;
      });
    };
    element && element.addEventListener('scroll', handler);
    return () => {
      element && element.removeEventListener('scroll', handler);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <SnackbarProvider>
          <Root>
            {isMobile ? (
              <MobileHeader isShrunk={isShrunk}>
                {sideBar}
                {toolbar}
              </MobileHeader>
            ) : (
              sideBar
            )}
            <Main ref={main} isShrunk={isShrunk}>
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
