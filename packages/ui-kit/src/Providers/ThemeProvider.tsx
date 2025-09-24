import React, { createContext, useEffect, useMemo, useState } from 'react';

import { Theme, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import {
  experimental_extendTheme as extendTheme,
  Experimental_CssVarsProvider as CssVarsProvider,
} from '@mui/material/styles';

export const ThemeTogglerContext = createContext({
  mode: 'light',
  toggle: () => { },
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme: {
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
    () =>
      (window.localStorage.getItem('rosen:theme') as 'light' | 'dark') ||
      preferredMode,
  );

  const theme: Theme =
    'light' in input && 'dark' in input ? input[mode] : input;

  const toggle = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    window.localStorage.setItem('rosen:theme', nextMode);
  };

  const theme1 = useMemo(() => {
    return extendTheme({
      cssVarPrefix: 'rosen',
      ...theme
    });
  }, [theme])

  return (
    <ThemeTogglerContext.Provider value={{ mode, toggle }}>
      <CssVarsProvider theme={theme1}>
        {children}
      </CssVarsProvider>
    </ThemeTogglerContext.Provider>
  );
};

export default ThemeProvider;
