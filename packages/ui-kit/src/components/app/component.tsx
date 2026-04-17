import { ReactNode } from 'react';

import { CssBaseline } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { useBreakpoint } from '@/hooks';
import { ThemeProvider, ThemeProviderProps, ToastProvider } from '@/Providers';
import { OverridableType } from '@/types';

import './styles.scss';

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

export const AppBase = (props: AppProps) => {
  return (
    <ThemeProvider theme={props.theme}>
      <>
        <CssBaseline />
        <ToastProvider>
          <Content {...props} />
        </ToastProvider>
      </>
    </ThemeProvider>
  );
};

AppBase.displayName = 'App';

export const App = Wrap(AppBase);
