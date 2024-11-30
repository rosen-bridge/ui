import React, { createContext, useState } from 'react';

import { Theme, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useLocalStorageManager } from '@rosen-ui/common-hooks';

export const ThemeTogglerContext = createContext({
  mode: 'light',
  toggle: () => {},
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme:
    | Theme
    | {
        light: Theme;
        dark: Theme;
      };
}

export const ThemeProvider = ({
  children,
  theme: input,
}: ThemeProviderProps) => {
  const localStorageManager = useLocalStorageManager();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const preferredMode = prefersDarkMode ? 'dark' : 'light';

  const [mode, setMode] = useState<'light' | 'dark'>(
    localStorageManager.get<'light' | 'dark'>('colorMode') || preferredMode,
  );

  const theme: Theme =
    'light' in input && 'dark' in input ? input[mode] : input;

  const toggle = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    localStorageManager.set('colorMode', nextMode);
  };

  return (
    <ThemeTogglerContext.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeTogglerContext.Provider>
  );
};

export default ThemeProvider;
