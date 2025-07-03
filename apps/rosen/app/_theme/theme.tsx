import {
  createTheme,
  darkThemeOptions,
  lightThemeOptions,
} from '@rosen-bridge/ui-kit';

export const theme = {
  light: createTheme(lightThemeOptions, {
    components: {
      MuiTextField: {
        defaultProps: {
          variant: 'filled',
        },
      },
    },
  }),
  dark: createTheme(darkThemeOptions),
};
