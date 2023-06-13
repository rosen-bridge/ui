import React, { createContext, useMemo, useState } from 'react';

import {
  CssBaseline,
  ThemeProvider as UiKitThemeProvider,
  createTheme,
  useMediaQuery,
} from '@rosen-bridge/ui-kit';

export const ColorModeContext = createContext({ toggle: () => {} });

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

export interface AppThemeProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: AppThemeProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const [mode, setMode] = useState<'light' | 'dark'>(
    prefersDarkMode ? 'dark' : 'light'
  );

  const colorMode = useMemo(
    () => ({
      toggle: () => {
        setMode((previousMode) =>
          previousMode === 'light' ? 'dark' : 'light'
        );
      },
    }),
    []
  );

  const theme = useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              primary: {
                light: '#ebf2ff',
                main: '#2c73d2',
                dark: '#1b5eb8',
                contrastText: '#fff',
              },
              secondary: {
                light: '#d2b8fd',
                main: '#845ec2',
                dark: '#543487',
                contrastText: '#fff',
              },
              info: {
                light: '#cdeaea',
                main: '#008e9b',
                dark: '#006d77',
                contrastText: '#fff',
              },
              success: {
                light: '#d9eeeb',
                main: '#008f7a',
                dark: '#006666',
                contrastText: '#fff',
              },
              warning: {
                light: '#fff9e2',
                main: '#c89d09',
                dark: '#8f6f00',
                contrastText: '#fff',
              },
              error: {
                light: '#eed9d9',
                main: '#cf1717',
                dark: '#8f0000',
                contrastText: '#fff',
              },
              background: {
                default: '#ffffff',
                paper: '#ffffff',
              },
            }
          : {
              primary: {
                light: '#accbeb',
                main: '#1f56a0',
                dark: '#1b5eb8',
                contrastText: '#fff',
              },
              secondary: {
                light: '#d2b8fd',
                main: '#5c487d',
                dark: '#231933',
                contrastText: '#fff',
              },
              info: {
                light: '#9edde3',
                main: '#036a73',
                dark: '#006d77',
                contrastText: '#fff',
              },
              success: {
                light: '#184c4c',
                main: '#008f7a',
                dark: '#d9eeeb',
                contrastText: '#fff',
              },
              warning: {
                light: '#5a4b1d',
                main: '#c89d09',
                dark: '#fff9e2',
                contrastText: '#fff',
              },
              error: {
                light: '#431616',
                main: '#cf1717',
                dark: '#eed9d9',
                contrastText: '#fff',
              },
              background: {
                default: '#2b1f3f',
                paper: '#2b1f3f',
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
              ? baseTheme.palette.secondary.dark
              : baseTheme.palette.secondary.light,
        },
        h2: {
          fontSize: '1.5rem',
        },
        body: {
          fontSize: '1rem',
        },
        body2: {
          fontSize: '0.75rem',
          color: baseTheme.palette.text.secondary,
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
        MuiTable: {
          styleOverrides: {
            root: {
              tableLayout: 'fixed',
            },
          },
        },
        MuiPagination: {
          defaultProps: {
            color: 'primary',
          },
        },
        MuiTableBody: {
          styleOverrides: {
            root: {
              '& tr.divider:not(:first-of-type)': {
                borderTop: `1px solid ${baseTheme.palette.divider}`,
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderWidth: 0,
            },
            body: {
              [baseTheme.breakpoints.down('tablet')]: {
                verticalAlign: 'top',
                '&:not(.MuiTableCell-paddingNone)': {
                  padding: baseTheme.spacing(1),
                },
                '&:first-of-type': {
                  color: baseTheme.palette.text.secondary,
                },
              },
            },
            head: {
              backgroundColor:
                mode === 'light' ? baseTheme.palette.primary.dark : '#ffffff11',
              color: baseTheme.palette.primary.contrastText,
              whiteSpace: 'noWrap',
              '&:nth-of-type(1)': {
                borderTopLeftRadius: baseTheme.shape.borderRadius,
                borderBottomLeftRadius: baseTheme.shape.borderRadius / 2,
              },
              '&:nth-last-of-type(1)': {
                borderTopRightRadius: baseTheme.shape.borderRadius,
                borderBottomRightRadius: baseTheme.shape.borderRadius / 2,
              },
              [baseTheme.breakpoints.down('tablet')]: {
                padding: baseTheme.spacing(1),
              },
            },
            footer: {
              backgroundColor: mode === 'light' ? '#00000011' : '#ffffff11',
              '&:nth-of-type(1)': {
                borderTopLeftRadius: baseTheme.shape.borderRadius / 2,
                borderBottomLeftRadius: baseTheme.shape.borderRadius,
              },
              '&:nth-last-of-type(1)': {
                borderTopRightRadius: baseTheme.shape.borderRadius / 2,
                borderBottomRightRadius: baseTheme.shape.borderRadius,
              },
            },
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
