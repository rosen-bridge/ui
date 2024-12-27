import React, { createContext, useState } from 'react';

import { Theme, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

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
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const preferredMode = prefersDarkMode ? 'dark' : 'light';

  const [mode, setMode] = useState<'light' | 'dark'>(
    (() => {
      const rawData = window.localStorage.getItem('colorMode');
      return rawData
        ? (JSON.parse(rawData) as 'light' | 'dark')
        : preferredMode;
    })(),
  );

  const theme: Theme =
    'light' in input && 'dark' in input ? input[mode] : input;

  const toggle = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    window.localStorage.setItem('colorMode', nextMode);
  };

  return (
    <ThemeTogglerContext.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeTogglerContext.Provider>
  );
};

export default ThemeProvider;
