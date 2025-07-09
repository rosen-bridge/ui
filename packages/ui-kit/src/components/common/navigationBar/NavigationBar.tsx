import { ReactNode } from 'react';

import { styled } from '../../../styling';
import { NavigationBarContext } from './NavigationBarContext';

const Root = styled('div', {
  name: 'RosenNavigationBar',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: '1',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'row',
    position: 'fixed',
    zIndex: '1',
    border: `solid 1px ${theme.palette.primary.light}`,
    borderRadius: theme.shape.borderRadius,
    inset: 'auto 8px 6px 8px',
    background: theme.palette.background.paper,
  },
}));

export type NavigationBarProps = {
  children: ReactNode;
  isActive: (path: string) => boolean;
  onClick: (path: string) => void;
};

export const NavigationBar = ({
  children,
  isActive,
  onClick,
}: NavigationBarProps) => {
  const state = {
    click: onClick,
    isActive,
  };
  return (
    <NavigationBarContext.Provider value={state}>
      <Root>{children}</Root>
    </NavigationBarContext.Provider>
  );
};
