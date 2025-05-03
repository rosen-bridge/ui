import {
  createTheme,
  darkThemeOptions,
  lightThemeOptions,
} from '@rosen-bridge/ui-kit';

const customLightThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#733F92',
      light: '#E3D9E9',
      dark: '#452658',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#DD704F',
      light: '#F5D4CA',
      dark: '#B15A3F',
      contrastText: '#FFFFFF',
    },
    background: {
      paper: '#ffffff',
      default: '#F1ECF4',
    },
  },
};

const customDarkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#8F65A8',
      light: '#2E193A',
      dark: '#C7B2D3',
      contrastText: '#000000',
    },
    secondary: {
      main: '#B15A3F',
      light: '#251718',
      dark: '#C48D7C',
      contrastText: '#000000',
    },
    background: {
      paper: '#170D1D',
      default: '#0B060F',
    },
  },
};

export const theme = {
  light: createTheme(lightThemeOptions, customLightThemeOptions),
  dark: createTheme(darkThemeOptions, customDarkThemeOptions),
};
