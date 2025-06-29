import {
  createTheme,
  darkThemeOptions,
  lightThemeOptions,
} from '@rosen-bridge/ui-kit';

declare module '@mui/material/styles' {
  interface TypeTertiary {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  }
  interface Palette {
    tertiary: TypeTertiary;
  }
}

const customLightThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#0B7975',
      light: '#CEE4E3',
      dark: '#074946',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#DD704F',
      light: '#F5D4CA',
      dark: '#B15A3F',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#42559E',
      light: '#D9DDEC',
      dark: '#28335F',
      contrastText: '#FFFFFF',
    },
    background: {
      paper: '#ffffff',
      default: '#E7F2F1',
    },
  },
};

const customDarkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#296664',
      light: '#021C1B',
      dark: '#9DC9C8',
      contrastText: '#000000',
    },
    secondary: {
      main: '#B15A3F',
      light: '#251718',
      dark: '#C48D7C',
      contrastText: '#000000',
    },
    tertiary: {
      main: '#6877B1',
      light: '#131725',
      dark: '#B3BBD8',
      contrastText: '#000000',
    },
    background: {
      paper: '#021414',
      default: '#010C0C',
    },
  },
};

export const theme = {
  light: createTheme(lightThemeOptions, customLightThemeOptions),
  dark: createTheme(darkThemeOptions, customDarkThemeOptions),
};
