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
