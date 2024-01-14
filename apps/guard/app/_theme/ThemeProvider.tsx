import React, { createContext, useMemo, useState } from 'react';

import {
  CssBaseline,
  ThemeProvider as UiKitThemeProvider,
  createTheme,
  useMediaQuery,
} from '@rosen-bridge/ui-kit';
import { useLocalStorageManager } from '@rosen-ui/utils';

export const ColorModeContext = createContext({ toggle: () => {} });

export interface AppThemeProps {
  children: React.ReactNode;
}

type ColorModes = 'light' | 'dark';

/**
 * provide theme and color mode
 */
const ThemeProvider = ({ children }: AppThemeProps) => {
  const localStorageManager = useLocalStorageManager();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const preferredColorMode = prefersDarkMode ? 'dark' : 'light';

  const [mode, setMode] = useState<ColorModes>(
    localStorageManager.get<ColorModes>('colorMode') || preferredColorMode,
  );

  const colorMode = useMemo(
    () => ({
      toggle: () => {
        const newColorMode = mode === 'light' ? 'dark' : 'light';
        setMode(newColorMode);
        localStorageManager.set('colorMode', newColorMode);
      },
    }),
    [localStorageManager, mode],
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
                default: '#f7f7f7',
                paper: '#fff',
                shadow: '#00000033',
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
                light: '#d9eeeb',
                main: '#008f7a',
                dark: '#184c4c',
                contrastText: '#fff',
              },
              warning: {
                light: '#fff9e2',
                main: '#c89d09',
                dark: '#5a4b1d',
                contrastText: '#fff',
              },
              error: {
                light: '#eed9d9',
                main: '#cf1717',
                dark: '#431616',
                contrastText: '#fff',
              },
              background: {
                default: '#1a2f4b',
                paper: '#28475c',
                shadow: '#00000033',
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
        h5: {
          fontSize: '1rem',
        },
        body: {
          fontSize: '1rem',
        },
        body2: {
          fontSize: '0.75rem',
          color: theme.palette.text.secondary,
        },
        subtitle2: {
          fontSize: '0.625rem',
          [theme.breakpoints.down('tablet')]: {
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
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
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
        MuiDialogActions: {
          styleOverrides: {
            root: {
              flexDirection: 'row-reverse',
              justifyContent: 'end',
              gap: theme.spacing(1),
              padding: theme.spacing(1, 3),
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
