import {
  createTheme,
  darkThemeOptions,
  lightThemeOptions,
  type Theme,
} from '@rosen-bridge/ui-kit';

export const base = {
  components: {
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          overflow: 'hidden',
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.default,
          minHeight: theme.spacing(7),
          transition: theme.transitions.create([
            'background-color',
            'box-shadow',
          ]),
          '&:hover': {
            backgroundColor: theme.palette.background.default,
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.neutral.light,
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.background.default,
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
  },
};

const customLightThemeOptions = {
  ...base,
  palette: {
    mode: 'light',
    primary: {
      main: '#733F92',
      light: '#E3D9E9',
      dark: '#452658',
      contrastText: '#FFFFFF',
    },
    background: {
      paper: '#ffffff',
      default: '#F1ECF4',
    },
  },
};

const customDarkThemeOptions = {
  ...base,
  palette: {
    mode: 'dark',
    primary: {
      main: '#B275D7',
      light: '#2E2136',
      dark: '#C7B2D3',
      contrastText: '#000000',
    },
    background: {
      paper: '#221C26',
      default: '#18141A',
    },
  },
};

export const theme = {
  light: createTheme(lightThemeOptions, customLightThemeOptions),
  dark: createTheme(darkThemeOptions, customDarkThemeOptions),
};
