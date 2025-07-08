import {
  createTheme,
  darkThemeOptions,
  lightThemeOptions,
} from '@rosen-bridge/ui-kit';

const rosenThemeOptions = {
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
};

export const theme = {
  light: createTheme(lightThemeOptions, rosenThemeOptions),
  dark: createTheme(darkThemeOptions, rosenThemeOptions),
};
