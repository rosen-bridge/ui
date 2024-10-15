import { Theme } from '@mui/material';
import { createTheme } from '@rosen-bridge/ui-kit';

declare module '@mui/material/styles' {
  interface TypeBackground {
    root: string;
    content: string;
    paper: string;
    header: string;
    shadow: string;
    input: string;
  }

  interface TypePaletteGradient {
    baseOrange: string;
    lightOrange: string;
    lightDarkBackground: string;
    baseDarkBackground: string;
    darkBackgroundMid: string;
    darkBackgroundMain: string;
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

const light = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#d3e1f0',
      main: '#396da3',
      dark: '#25476a',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffcd38',
      main: '#ffc107',
      dark: '#b28704',
      contrastText: '#1A1A1A',
    },
    gradient: {
      baseOrange: '#fc7b41',
      lightOrange: '#e2844a',
      lightDarkBackground: '#52617e',
      baseDarkBackground: '#164b7d',
      darkBackgroundMid: '#4a626e',
      darkBackgroundMain: '#1e2130',
    },
    background: {
      root: '#1A1A1A',
      content: 'rgba(247, 247, 247, 0.9)',
      paper: 'rgb(247, 247, 247)',
      header: '#E1E1E1',
      shadow: 'rgba(0, 0, 0, 0.2)',
      input: '#fff',
    },
    info: {
      light: '#f1f5ff',
      main: '#5873de',
      dark: '#384d78',
      contrastText: '#fff',
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
      light: '#d3e1f0',
      main: '#396da3',
      dark: '#25476a',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffcd38',
      main: '#ffc107',
      dark: '#b28704',
      contrastText: '#1A1A1A',
    },
    gradient: {
      baseOrange: '#fc7b41',
      lightOrange: '#e2844a',
      lightDarkBackground: '#52617e',
      baseDarkBackground: '#164b7d',
      darkBackgroundMid: '#4a626e',
      darkBackgroundMain: '#1e2130',
    },
    background: {
      root: '#0D1721',
      content: '#2f3a48',
      paper: 'rgb(26, 32, 41)',
      header: '#253041',
      shadow: 'rgba(0, 0, 0, 0.2)',
      input: 'rgb(40, 49, 63)',
    },
    info: {
      light: '#9cbdd9',
      main: '#2c396f',
      dark: '#132236',
      contrastText: '#fff',
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
    typography: {
      h1: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color:
          baseTheme.palette.mode === 'light'
            ? baseTheme.palette.primary.dark
            : baseTheme.palette.primary.light,
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
        [baseTheme.breakpoints.down('tablet')]: {
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
      MuiButton: {
        styleOverrides: {
          textPrimary: {
            color:
              baseTheme.palette.mode === 'light'
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
          filledSuccess: {
            color: baseTheme.palette.success.dark,
            backgroundColor: baseTheme.palette.success.light,
          },
          filledError: {
            color: baseTheme.palette.error.dark,
            backgroundColor: baseTheme.palette.error.light,
          },
        },
      },
    },
  });

export const theme = {
  light: create(light),
  dark: create(dark),
};
