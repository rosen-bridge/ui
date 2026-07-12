import type { ReactNode } from 'react';

import { useBreakpoint, useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface AppOverrides {}

export type AppOwnProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export type AppBaseProps = ElementBaseProps<'div', AppOwnProps>;

export type AppProps = OverridableType<AppBaseProps, AppOverrides, never>;

export const App = (props: AppProps) => {
  const { children, sidebar, ...rest } = useConfig('App', props);

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

App.displayName = 'App';
