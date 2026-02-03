import {
  alpha,
  ComponentsOverrides,
  ComponentsVariants,
  SvgIcon,
  Theme,
  ThemeOptions,
} from '@mui/material';
import {
  CheckCircle,
  ExclamationCircle,
  ExclamationTriangle,
  InfoCircle,
} from '@rosen-bridge/icons';

import { AppProps } from '../components';

declare module '@mui/material/styles' {
  interface TypeBackground {
    shadow: string;
  }

  interface TypeNeutral {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  }

  interface TypeTertiary {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  }

  interface Palette {
    background: TypeBackground;
    neutral: TypeNeutral;
    tertiary: TypeTertiary;
  }

  interface PaletteOptions {
    neutral?: Partial<TypeNeutral>;
  }

  interface ComponentNameToClassKey {
    RosenApp: 'root' | 'main';
    RosenNavigationBar: 'root';
  }

  interface ComponentsPropsList {
    RosenApp: Partial<AppProps>;
  }

  interface Components {
    RosenApp?: {
      defaultProps?: ComponentsPropsList['RosenApp'];
      styleOverrides?: ComponentsOverrides<Theme>['RosenApp'];
      variants?: ComponentsVariants['RosenApp'];
    };
    RosenNavigationBar?: {
      styleOverrides?: ComponentsOverrides<Theme>['RosenNavigationBar'];
    };
  }
}

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#42559E',
      light: '#D9DDEC',
      dark: '#28335F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#DD704F',
      light: '#F5D4CA',
      dark: '#B15A3F',
      contrastText: '#FFFFFF',
    },
    background: {
      paper: '#FFFFFF',
      default: '#EBEDF7',
      shadow: 'rgba(0, 0, 0, 0.2)',
    },
    neutral: {
      main: '#737373',
      light: '#E6E6E6',
      dark: '#545454',
      contrastText: '#000000',
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
      main: '#2C70B5',
      light: '#C0D6ED',
      dark: '#12477D',
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
  typography: {
    h1: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
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
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    subtitle1: {
      fontSize: '1.5rem',
    },
    subtitle2: {
      fontSize: '0.625rem',
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        h1: ({ theme }: { theme: Theme }) =>
          theme.palette.mode === 'light'
            ? {
                background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
            : {
                color: theme.palette.secondary.dark,
              },
        body2: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.text.secondary,
        }),
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontSize: '1rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedSecondary: ({ theme }: { theme: Theme }) => ({
          'color': theme.palette.text.primary,
          'backgroundColor': theme.palette.neutral.light,
          '&:hover': {
            backgroundColor: theme.palette.neutral.light,
          },
        }),
        root: ({ theme }: { theme: Theme }) => ({
          padding: theme.spacing(1, 2),
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.secondary.dark,
          fontSize: theme.spacing(3),
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          padding: theme.spacing(3),
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
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
            'borderRadius': theme.spacing(2),
            'backgroundColor': alpha(theme.palette.background.paper, 0.75),
            'minHeight': theme.spacing(7),
            'transition': theme.transitions.create([
              'background-color',
              'box-shadow',
            ]),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 1.0),
            },
            '&.Mui-disabled': {
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
            },
            '&.Mui-focused': {
              backgroundColor: alpha(theme.palette.background.paper, 1.0),
            },
          },
          'fieldset': {
            border: 'none',
          },
        }),
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          'overflow': 'hidden',
          'borderRadius': theme.shape.borderRadius,
          'backgroundColor': alpha(theme.palette.background.paper, 0.75),
          'minHeight': theme.spacing(7),
          'transition': theme.transitions.create([
            'background-color',
            'box-shadow',
          ]),
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 1.0),
          },
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.background.paper, 1.0),
          },
          '&::-webkit-outer-spin-button,input::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
          },
        }),
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
        standardError: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.error.main,
          backgroundColor: theme.palette.error.light,
        }),
        standardInfo: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.info.main,
          backgroundColor: theme.palette.info.light,
        }),
        standardSuccess: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.success.main,
          backgroundColor: theme.palette.success.light,
        }),
        standardWarning: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.warning.main,
          backgroundColor: theme.palette.warning.light,
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.primary.dark,
          borderRadius: theme.shape.borderRadius / 2,
        }),
        arrow: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.primary.dark,
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        text: ({ theme }: { theme: Theme }) => ({
          borderRadius: theme.spacing(0.5),
        }),
      },
    },
    RosenNavigationBar: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          [theme.breakpoints.down('tablet')]: {
            borderColor: theme.palette.primary.light,
            background: theme.palette.background.paper,
            boxShadow: `0px 8px 8px 0px ${theme.palette.background.default}`,
          },
        }),
      },
    },
    RosenApp: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
              : theme.palette.background.paper,
          color:
            theme.palette.mode === 'light'
              ? theme.palette.common.white
              : theme.palette.text.primary,
          [theme.breakpoints.down('tablet')]: {
            background:
              theme.palette.mode === 'light'
                ? `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
                : theme.palette.primary.light,
          },
        }),
      },
    },
  },
};

export const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#6E89F7',
      light: '#1A1E2E',
      dark: '#B3BBD8',
      contrastText: '#000000',
    },
    secondary: {
      main: '#B15A3F',
      light: '#3D2D29',
      dark: '#C48D7C',
      contrastText: '#000000',
    },
    text: {
      primary: '#FFFFFFDE',
      secondary: '#FFFFFF99',
      disabled: '#FFFFFF61',
    },
    background: {
      paper: '#1F2937',
      default: '#111827',
      shadow: 'rgba(0, 0, 0, 0.2)',
    },
    neutral: {
      main: '#707070',
      light: '#333333',
      dark: '#B7B7B7',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C04343',
      light: '#402626',
      dark: '#DEADAD',
      contrastText: '#000',
    },
    warning: {
      main: '#BF783E',
      light: '#2A1F16',
      dark: '#CEB199',
      contrastText: '#000',
    },
    success: {
      main: '#2B7D60',
      light: '#253731',
      dark: '#A1D7C4',
      contrastText: '#000',
    },
    info: {
      main: '#3E70A3',
      light: '#16385A',
      dark: '#A3BFDC',
      contrastText: '#000',
    },
  },
};
