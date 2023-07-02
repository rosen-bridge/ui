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

/**
 * provide theme and color mode
 */
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
    let theme = createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              primary: {
                light: '#6cac9c',
                main: '#6cac9c',
                dark: '#438070',
                contrastText: '#fff',
              },
              secondary: {
                light: '#ffd8d2',
                main: '#fa9384',
                dark: '#e36b77',
                contrastText: '#fff',
              },
              info: {
                light: '#f1f5ff',
                main: '#5873de',
                dark: '#384d78',
                contrastText: '#fff',
              },
              success: {
                light: '#6cac9c',
                main: '#008f7a',
                dark: '#007664',
                contrastText: '#fff',
              },
              background: {
                default: '#f7f7f7',
                paper: '#fff',
              },
            }
          : {
              primary: {
                light: '#6cac9c',
                main: '#6cac9c',
                dark: '#6cac9c',
                contrastText: '#fff',
              },
              secondary: {
                light: '#fa9384',
                main: '#71353b',
                dark: '#71353b',
                contrastText: '#fff',
              },
              info: {
                light: '#bdccff',
                main: '#2c396f',
                dark: '#132236',
                contrastText: '#fff',
              },
              success: {
                light: '#6cac9c',
                main: '#008f7a',
                dark: '#006453',
                contrastText: '#fff',
              },
              background: {
                default: '#1a2f4b',
                paper: '#28475c',
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
    return createTheme(theme, {
      typography: {
        h1: {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color:
            mode === 'light'
              ? theme.palette.info.dark
              : theme.palette.info.light,
        },
        h2: {
          fontSize: '1.5rem',
        },
        body: {
          fontSize: '1rem',
        },
        body2: {
          fontSize: '0.75rem',
          color: theme.palette.text.secondary,
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
        MuiPagination: {
          defaultProps: {
            color: 'primary',
          },
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              [theme.breakpoints.up('tablet')]: {
                padding: theme.spacing(0, 2),
              },
            },
          },
        },
        MuiTable: {
          styleOverrides: {
            root: {
              tableLayout: 'fixed',
            },
          },
        },
        MuiTableBody: {
          styleOverrides: {
            root: {
              '& tr.shaded': {
                backgroundColor:
                  mode === 'light'
                    ? theme.palette.info.light
                    : theme.palette.info.dark + '22',
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
              [theme.breakpoints.down('tablet')]: {
                verticalAlign: 'top',
                '&:not(.MuiTableCell-paddingNone)': {
                  padding: theme.spacing(1),
                },
                '&:first-of-type': {
                  color: theme.palette.text.secondary,
                },
              },
            },
            head: {
              padding: theme.spacing(1, 2),
              backgroundColor: theme.palette.info.dark,
              color: theme.palette.info.contrastText,
              whiteSpace: 'noWrap',
              [theme.breakpoints.up('tablet')]: {
                '&:nth-of-type(1)': {
                  borderBottomLeftRadius: theme.shape.borderRadius / 2,
                },
                '&:nth-last-of-type(1)': {
                  borderBottomRightRadius: theme.shape.borderRadius / 2,
                },
              },
              [theme.breakpoints.down('tablet')]: {
                '&:nth-of-type(1)': {
                  borderTopLeftRadius: theme.shape.borderRadius / 2,
                },
                '&:nth-last-of-type(1)': {
                  borderTopRightRadius: theme.shape.borderRadius / 2,
                },
              },
            },
            footer: {
              borderTop: `1px solid ${theme.palette.divider}`,
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
