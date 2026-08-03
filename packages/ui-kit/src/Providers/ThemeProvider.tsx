import { createContext, type ReactNode, useMemo, useState } from 'react';

import { CssBaseline, type Theme, useMediaQuery } from '@mui/material';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';

export const ThemeTogglerContext = createContext({
  mode: 'light',
  toggle: () => {},
});

export interface ThemeProviderProps {
  children: ReactNode;
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

  const final = useMemo(() => {
    document.body.setAttribute('data-theme', theme.palette.mode);
    return createTheme({
      cssVariables: {
        cssVarPrefix: 'rosen',
      },
      ...theme,
    });
  }, [theme]);

  return (
    <ThemeTogglerContext.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={final}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeTogglerContext.Provider>
  );
};

export default ThemeProvider;
