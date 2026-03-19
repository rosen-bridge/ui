import { ComponentProps, ReactNode } from 'react';

import { OverridableType } from '@/types';
import { AppSnackbar, CssBaseline } from '@/components';
import { SnackbarProvider } from '@/contexts';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { useIsMobile } from '@/hooks';
import { ThemeProvider, ThemeProviderProps } from '@/Providers';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppOverrides {}

export type AppOwnProps = {
  children: ReactNode;
  sidebar: ReactNode;
  theme: ThemeProviderProps['theme'];
};

export type AppBaseProps = ElementBaseProps<'div', AppOwnProps>;

export type AppOverriddenProps = OverridableType<
  AppBaseProps,
  AppOverrides,
  never
>;

const Content = ({ children, sidebar, ...rest }: AppOverriddenProps) => {
  const isMobile = useIsMobile();
  return (
    <Root
      reflects={{ orientation: isMobile ? 'vertical' : 'horizontal' }}
      {...rest}
    >
      {sidebar}
      <div className="RosenApp-main">
        <div className="RosenApp-paper">{children}</div>
      </div>
      <AppSnackbar />
    </Root>
  );
};

export const AppBase = (props: AppOverriddenProps) => {
  return (
    <ThemeProvider theme={props.theme}>
      <>
        <CssBaseline />
        <SnackbarProvider>
          <Content {...props} />
        </SnackbarProvider>
      </>
    </ThemeProvider>
  );
};

AppBase.displayName = 'App';

export const App = Wrap(AppBase);

export type AppProps = ComponentProps<typeof App>;
