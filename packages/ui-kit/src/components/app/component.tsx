import { ReactNode } from 'react';

import { CssBaseline } from '@/components';
import { useBreakpoint, useConfig } from '@/hooks';
import { ThemeProvider, ThemeProviderProps } from '@/Providers';
import { ElementBaseProps, OverridableType } from '@/types';

import { SnackbarProvider } from '../../contexts';
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
  const isTabletDown = useBreakpoint('tablet-down');
  return (
    <div data-orientation={isTabletDown ? 'vertical' : 'horizontal'} {...rest}>
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
        <SnackbarProvider>
          <Content {...rest} />
        </SnackbarProvider>
      </>
    </ThemeProvider>
  );
};

App.displayName = 'App';
