import { ReactNode } from 'react';

import { useMediaQuery } from '@mui/material';

import { CssBaseline } from '@/components';
import { useBreakpoint, useConfig, useTheme } from '@/hooks';
import { ThemeProvider, ThemeProviderProps, ToastProvider } from '@/Providers';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppOverrides {}

export type AppOwnProps = {
  children: ReactNode;
  sidebar: ReactNode;
  theme: ThemeProviderProps['theme'];
};

export type AppBaseProps = ElementBaseProps<'div', AppOwnProps>;

export type AppProps = OverridableType<AppBaseProps, AppOverrides, never>;

const Content = ({ children, sidebar, ...rest }: AppProps) => {
  const theme = useTheme();

  const isTabletDown = useBreakpoint('tablet-down');

  const isMobile = useMediaQuery(theme.breakpoints.up('mobile'));
  const isTablet = useMediaQuery(theme.breakpoints.up('tablet'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('laptop'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('desktop'));

  return (
    <div
      data-breakpoint-mobile={isMobile ? '' : null}
      data-breakpoint-tablet={isTablet ? '' : null}
      data-breakpoint-laptop={isLaptop ? '' : null}
      data-breakpoint-desktop={isDesktop ? '' : null}
      data-orientation={isTabletDown ? 'vertical' : 'horizontal'}
      {...rest}
    >
      {sidebar}
      <div className="RosenApp-main">
        <div className="RosenApp-paper">{children}</div>
      </div>
    </div>
  );
};

export const App = (props: AppProps) => {
  const { ...rest } = useConfig('App', props);

  return (
    <ThemeProvider theme={rest.theme}>
      <>
        <CssBaseline />
        <ToastProvider>
          <Content {...rest} />
        </ToastProvider>
      </>
    </ThemeProvider>
  );
};

App.displayName = 'App';
