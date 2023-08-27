import React, { createContext, useMemo, useState } from 'react';

import {
  CssBaseline,
  ThemeProvider as UiKitThemeProvider,
  createTheme,
  useMediaQuery,
} from '@rosen-bridge/ui-kit';

export const ColorModeContext = createContext({ toggle: () => {} });

export interface AppThemeProps {
  children: React.ReactNode;
}

declare module '@mui/material/styles' {
  interface TypeBackground {
    root: string;
    content: string;
    paper: string;
    header: string;
    shadow: string;
  }

  interface TypePaletteGradient {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
  }

  interface Palette {
    gradient: TypePaletteGradient;
    background: TypeBackground;
  }
  interface PaletteOptions {
    gradient?: Partial<TypePaletteGradient>;
    background?: Partial<TypeBackground>;
  }
}

/**
 * provide theme and color mode
 */
const ThemeProvider = ({ children }: AppThemeProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const [mode, setMode] = useState<'light' | 'dark'>(
    prefersDarkMode ? 'dark' : 'light',
  );

  const colorMode = useMemo(
    () => ({
      toggle: () => {
        setMode((previousMode) =>
          previousMode === 'light' ? 'dark' : 'light',
        );
      },
    }),
    [],
  );

  const theme = useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode,
        primary: {
          light: '#d3e1f0',
          main: '#396da3',
          dark: '#25476a',
          contrastText: '#fff',
        },
        secondary: {
          light: '#ffcd38',
          main: '#ffc107',
          dark: '#b28704',
          contrastText: '#1A1A1A',
        },
        gradient: {
          a: '#fc7b41',
          b: '#e2844a',
          c: '#52617e',
          d: '#164b7d',
          e: '#4a626e',
          f: '#1e2130',
        },
        ...(mode === 'light'
          ? {
              background: {
                root: '#1A1A1A',
                content: 'rgba(247, 247, 247, 0.9)',
                paper: '#fff',
                header: '#E1E1E1',
                shadow: 'rgba(0, 0, 0, 0.2)',
              },
              info: {
                light: '#f1f5ff',
                main: '#5873de',
                dark: '#384d78',
                contrastText: '#fff',
              },
            }
          : {
              background: {
                root: '#0D1721',
                content: '#2f3a48',
                paper: '#1F2937',
                header: '#253041',
                shadow: 'rgba(0, 0, 0, 0.2)',
              },
              info: {
                light: '#9cbdd9',
                main: '#2c396f',
                dark: '#132236',
                contrastText: '#fff',
              },
            }),
      },
      shape: {
        borderRadius: 16,
      },
      breakpoints: {
        values: {
          mobile: 0,
          tablet: 640,
          laptop: 1024,
          desktop: 1200,
        },
      },
    });

    return createTheme(baseTheme, {
      typography: {
        h1: {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color:
            mode === 'light'
              ? baseTheme.palette.primary.dark
              : baseTheme.palette.primary.light,
        },
        h2: {
          fontSize: '1.5rem',
        },
        h3: {
          fontSize: '1.5rem',
        },
        h5: {
          fontSize: '1rem',
        },
        body: {
          fontSize: '1rem',
        },
        body2: {
          fontSize: '0.75rem',
          color: baseTheme.palette.text.secondary,
        },
        subtitle2: {
          fontSize: '0.625rem',
          [baseTheme.breakpoints.down('tablet')]: {
            fontSize: '0.5625rem',
          },
        },
      },
      components: {
        MuiCard: {
          defaultProps: {
            elevation: 0,
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            title: {
              fontSize: '1rem',
              fontWeight: 'bold',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            textPrimary: {
              color:
                mode === 'light'
                  ? baseTheme.palette.primary.main
                  : baseTheme.palette.primary.light,
            },
          },
        },
        MuiLoadingButton: {
          defaultProps: {
            variant: 'contained',
          },
        },
        MuiTextField: {
          defaultProps: {
            fullWidth: true,
          },
        },
        MuiSnackbar: {
          defaultProps: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              fontSize: '0.9rem',
            },
            filledSuccess: {
              color: baseTheme.palette.success.dark,
              backgroundColor: baseTheme.palette.success.light,
            },
            filledError: {
              color: baseTheme.palette.error.dark,
              backgroundColor: baseTheme.palette.error.light,
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <UiKitThemeProvider theme={theme}>
        <>
          <CssBaseline />
          {children}
        </>
      </UiKitThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeProvider;
