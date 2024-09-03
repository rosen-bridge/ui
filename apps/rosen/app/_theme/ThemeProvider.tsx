import React, { createContext, useMemo, useState } from 'react';

import {
  alpha,
  CssBaseline,
  ThemeProvider as UiKitThemeProvider,
  createTheme,
  useMediaQuery,
  SvgIcon,
} from '@rosen-bridge/ui-kit';
import { useLocalStorageManager } from '@rosen-ui/common-hooks';
import {
  CheckCircle,
  ExclamationCircle,
  ExclamationTriangle,
  InfoCircle,
} from '@rosen-bridge/icons';

export const ColorModeContext = createContext({ toggle: () => {} });

export interface AppThemeProps {
  children: React.ReactNode;
}

type ColorModes = 'light' | 'dark';

declare module '@mui/material/styles' {
  interface TypeBackground {
    root: string;
    content: string;
    paper: string;
    header: string;
    shadow: string;
    input: string;
    body: (desktop: boolean) => string;
  }

  interface TypePaletteGradient {
    background: string;
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
  const localStorageManager = useLocalStorageManager();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const preferredColorMode = prefersDarkMode ? 'dark' : 'light';

  const [mode, setMode] = useState<'light' | 'dark'>(
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
    const baseTheme = createTheme({
      palette: {
        mode,
        ...(mode == 'light'
          ? {
              primary: {
                main: '#42559E',
                light: '#D9DDEC',
                dark: '#28335F',
                contrastText: '#fff', // TODO
              },
              secondary: {
                main: '#DD704F',
                light: '#F5D4CA',
                dark: '#B15A3F',
                contrastText: '#1A1A1A', // TODO
              },
              background: {
                paper: '#FFFFFF',
                default: '#EBEDF7',
                body: (desktop: boolean) =>
                  desktop
                    ? 'linear-gradient(180deg, #28335F 0%, #B15A3F 100%)'
                    : 'linear-gradient(90deg, #28335F 0%, #B15A3F 100%)',
                root: '#1A1A1A', // TODO
                content: 'rgba(247, 247, 247, 0.9)', // TODO
                header: '#E1E1E1', // TODO
                shadow: 'rgba(0, 0, 0, 0.2)', // TODO
                input: '#fff', // TODO
              },
              text: {
                primary: 'rgba(0, 0, 0, 0.87)',
                secondary: 'rgba(0, 0, 0, 0.60)',
                disabled: 'rgba(0, 0, 0, 0.38)',
              },
              neutral: {
                main: '#737373',
                light: '#E6E6E6',
                dark: '#545454',
              },
              error: {
                main: '#C84242',
                light: '#F5CFCF',
                dark: '#9C3030',
              },
              warning: {
                main: '#CD7329',
                light: '#ECCCB2',
                dark: '#B65607',
              },
              success: {
                main: '#157E59',
                light: '#B3E3D2',
                dark: '#116044',
              },
              info: {
                main: '#42559E',
                light: '#D9DDEC',
                dark: '#28335F',
                // TODO
                contrastText: '#fff',
              },
            }
          : {
              primary: {
                main: '#6877B1',
                light: '#B3BBD8',
                dark: '#1A223F',
                contrastText: '#fff', // TODO
              },
              secondary: {
                main: '#B15A3F',
                light: '#C48D7C',
                dark: '#804330',
                contrastText: '#1A1A1A', // TODO
              },
              background: {
                paper: '#0D1120',
                default: '#070810',
                body: (desktop: boolean) => '#14192F',
                root: '#0D1721', // TODO
                content: '#2f3a48', // TODO
                header: '#253041', // TODO
                shadow: 'rgba(0, 0, 0, 0.2)', // TODO
                input: 'rgb(40, 49, 63)', // TODO
              },
              text: {
                primary: 'rgba(255, 255, 255, 0.87)',
                secondary: 'rgba(255, 255, 255, 0.60)',
                disabled: 'rgba(255, 255, 255, 0.38)',
              },
              neutral: {
                main: '#707070',
                light: '#B7B7B7',
                dark: '#424242',
              },
              error: {
                main: '#C04343',
                light: '#DEADAD',
                dark: '#7A2D2D',
              },
              warning: {
                main: '#BF783E',
                light: '#CEB199',
                dark: '#74451E',
              },
              success: {
                main: '#2B7D60',
                light: '#A1D7C4',
                dark: '#0C3426',
              },
              info: {
                main: '#3E70A3',
                light: '#A3BFDC',
                dark: '#16385A',
                contrastText: '#fff', // TODO
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
          ...(mode === 'light'
            ? {
                background: 'linear-gradient(180deg, #28335F 0%, #B15A3F 100%)',
                '-webkit-background-clip': 'text',
                '-webkit-text-fill-color': 'transparent',
              }
            : {
                color: baseTheme.palette.secondary.light,
              }),
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
        MuiFilledInput: {
          styleOverrides: {
            root: {
              overflow: 'hidden',
              borderRadius: baseTheme.shape.borderRadius,
              backgroundColor: alpha(baseTheme.palette.background.paper, 0.75),
              minHeight: baseTheme.spacing(8.5),
              transition: baseTheme.transitions.create([
                'background-color',
                'box-shadow',
              ]),
              '&:hover': {
                backgroundColor: alpha(baseTheme.palette.background.paper, 1.0),
              },
              '&.Mui-disabled': {
                backgroundColor: alpha(baseTheme.palette.background.paper, 0.5),
              },
              '&.Mui-focused': {
                backgroundColor: alpha(baseTheme.palette.background.paper, 1.0),
              },
              // TODO
              // 'input::-webkit-outer-spin-button,input::-webkit-inner-spin-button': {
              //   '-webkit-appearance': 'none',
              // },
            },
            input: {
              '&:focus': {
                backgroundColor: 'inherit',
              },
            },
          },
        },
        MuiSnackbar: {
          styleOverrides: {
            root: {
              left: '116px',
            },
          },
        },
        MuiAlert: {
          defaultProps: {
            iconMapping: {
              error: (
                <SvgIcon>
                  <ExclamationTriangle fontSize="inherit" />
                </SvgIcon>
              ),
              info: (
                <SvgIcon>
                  <InfoCircle fontSize="inherit" />
                </SvgIcon>
              ),
              success: (
                <SvgIcon>
                  <CheckCircle fontSize="inherit" />
                </SvgIcon>
              ),
              warning: (
                <SvgIcon>
                  <ExclamationCircle fontSize="inherit" />
                </SvgIcon>
              ),
            },
          },
          styleOverrides: {
            root: {
              fontSize: '0.875rem',
            },
            standardError: {
              color: baseTheme.palette.error.main,
              backgroundColor: baseTheme.palette.error.light,
            },
            standardInfo: {
              color: baseTheme.palette.info.main,
              backgroundColor: baseTheme.palette.info.light,
            },
            standardSuccess: {
              color: baseTheme.palette.success.main,
              backgroundColor: baseTheme.palette.success.light,
            },
            standardWarning: {
              color: baseTheme.palette.warning.main,
              backgroundColor: baseTheme.palette.warning.light,
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
