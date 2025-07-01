import { createContext } from 'react';

import { NavigationBarState } from './types';

export const NavigationBarContext = createContext<
  NavigationBarState | undefined
>(undefined);
