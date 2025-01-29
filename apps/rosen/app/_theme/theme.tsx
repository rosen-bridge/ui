import {
  CheckCircle,
  ExclamationCircle,
  ExclamationTriangle,
  InfoCircle,
} from '@rosen-bridge/icons';
import { alpha, createTheme, SvgIcon, Theme } from '@rosen-bridge/ui-kit';

declare module '@mui/material/styles' {
  interface TypeNeutral {
    main: string;
    light: string;
    dark: string;
  }

  interface TypeBackground {
    paper: string;
    shadow: string;
    body: (desktop: boolean) => string;
  }

  interface TypePaletteGradient {
    background: string;
  }

  interface Palette {
    gradient: TypePaletteGradient;
    background: TypeBackground;
    neutral: TypeNeutral;
  }

  interface PaletteOptions {
    gradient?: Partial<TypePaletteGradient>;
    background?: Partial<TypeBackground>;
    neutral?: Partial<TypeNeutral>;
  }
}

const light = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D9DDEC',
      light: '#42559E',
      dark: '#28335F',
    },
    secondary: {
      main: '#DD704F',
      light: '#F5D4CA',
      dark: '#B15A3F',
    },
    background: {
      paper: '#FFFFFF',
      default: '#EBEDF7',
      body: (desktop: boolean) =>
        desktop
          ? 'linear-gradient(180deg, #28335F 0%, #B15A3F 100%)'
          : 'linear-gradient(90deg, #28335F 0%, #B15A3F 100%)',
      shadow: 'rgba(0, 0, 0, 0.2)',
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
    },
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

const dark = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6877B1',
      light: '#B3BBD8',
      dark: '#1A223F',
    },
    secondary: {
      main: '#B15A3F',
      light: '#C48D7C',
      dark: '#804330',
    },
    background: {
      paper: '#0D1120',
      default: '#070810',
      body: (desktop: boolean) => '#14192F',
      shadow: 'rgba(0, 0, 0, 0.2)',
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
    },
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

const create = (baseTheme: Theme) =>
  createTheme(baseTheme, {
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
          containedSecondary: {
            'color': baseTheme.palette.text.primary,
            'backgroundColor': baseTheme.palette.neutral.light,
            '&:hover': {
              backgroundColor: baseTheme.palette.neutral.light,
            },
          },
          root: {
            padding: baseTheme.spacing(1) + ' ' + baseTheme.spacing(2),
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: baseTheme.palette.secondary.dark,
            fontSize: baseTheme.spacing(3),
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(3),
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
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '.MuiInputLabel-root': {
              'transform': 'translate(12px, 16px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(12px, 7px) scale(0.75)',
              },
            },
            '.MuiAutocomplete-input': {
              transform: 'translateY(8px)',
            },
            '.MuiOutlinedInput-root': {
              'overflow': 'hidden',
              'borderRadius': baseTheme.spacing(2),
              'backgroundColor': alpha(
                baseTheme.palette.background.paper,
                0.75,
              ),
              'minHeight': baseTheme.spacing(8.5),
              'transition': baseTheme.transitions.create([
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
            },
            'fieldset': {
              border: 'none',
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            'overflow': 'hidden',
            'borderRadius': baseTheme.shape.borderRadius,
            'backgroundColor': alpha(baseTheme.palette.background.paper, 0.75),
            'minHeight': baseTheme.spacing(8.5),
            'transition': baseTheme.transitions.create([
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
            '&::-webkit-outer-spin-button,input::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
            },
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
      RosenNavigationBar: {
        styleOverrides: {
          root: {
            [baseTheme.breakpoints.down('tablet')]: {
              borderColor: baseTheme.palette.primary.light,
              background: baseTheme.palette.background.paper,
              boxShadow: `0px 8px 8px 0px ${baseTheme.palette.background.default}`,
            },
          },
        },
      },
      RosenApp: {
        styleOverrides: {
          root: {
            background: baseTheme.palette.background.body(true),
            [baseTheme.breakpoints.down('tablet')]: {
              background: baseTheme.palette.background.body(false),
            },
          },
        },
      },
    },
    typography: {
      h1: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        ...(baseTheme.palette.mode === 'light'
          ? {
              background: 'linear-gradient(180deg, #28335F 0%, #B15A3F 100%)',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
  });

export const theme = {
  light: create(light),
  dark: create(dark),
};
