import { Theme } from '@mui/material';
import { createTheme } from '@rosen-bridge/ui-kit';

declare module '@mui/material/styles' {
  interface TypePaletteGradient {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
  }
  interface Palette {
    gradient: TypePaletteGradient;
  }
  interface PaletteOptions {
    gradient?: Partial<TypePaletteGradient>;
  }
}

const light = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#ebf2ff',
      main: '#2c73d2',
      dark: '#1b5eb8',
      contrastText: '#fff',
    },
    secondary: {
      light: '#d2b8fd',
      main: '#845ec2',
      dark: '#543487',
      contrastText: '#fff',
    },
    info: {
      light: '#cdeaea',
      main: '#008e9b',
      dark: '#006d77',
      contrastText: '#fff',
    },
    success: {
      light: '#d9eeeb',
      main: '#008f7a',
      dark: '#006666',
      contrastText: '#fff',
    },
    warning: {
      light: '#fff9e2',
      main: '#c89d09',
      dark: '#8f6f00',
      contrastText: '#fff',
    },
    error: {
      light: '#eed9d9',
      main: '#cf1717',
      dark: '#8f0000',
      contrastText: '#fff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      shadow: '#00000033',
    },
    gradient: {
      a: '#845ec2',
      b: '#2c73d2',
      c: '#0081cf',
      d: '#0089ba',
      e: '#008e9b',
      f: '#008f7a',
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
      light: '#accbeb',
      main: '#1f56a0',
      dark: '#1b5eb8',
      contrastText: '#fff',
    },
    secondary: {
      light: '#d2b8fd',
      main: '#5c487d',
      dark: '#231933',
      contrastText: '#fff',
    },
    info: {
      light: '#9edde3',
      main: '#036a73',
      dark: '#006d77',
      contrastText: '#fff',
    },
    success: {
      light: '#d9eeeb',
      main: '#008f7a',
      dark: '#184c4c',
      contrastText: '#fff',
    },
    warning: {
      light: '#fff9e2',
      main: '#c89d09',
      dark: '#5a4b1d',
      contrastText: '#fff',
    },
    error: {
      light: '#eed9d9',
      main: '#cf1717',
      dark: '#431616',
      contrastText: '#fff',
    },
    background: {
      default: '#2b1f3f',
      paper: '#2b1f3f',
      shadow: '#00000033',
    },
    gradient: {
      a: '#845ec2',
      b: '#2c73d2',
      c: '#0081cf',
      d: '#0089ba',
      e: '#008e9b',
      f: '#008f7a',
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
            ? baseTheme.palette.secondary.dark
            : baseTheme.palette.secondary.light,
      },
      h2: {
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
      MuiTable: {
        styleOverrides: {
          root: {
            tableLayout: 'fixed',
          },
        },
      },
      MuiPagination: {
        defaultProps: {
          color: 'primary',
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& tr.divider:not(:first-of-type)': {
              borderTop: `1px solid ${baseTheme.palette.divider}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderWidth: 0,
          },
          body: {
            [baseTheme.breakpoints.down('tablet')]: {
              'verticalAlign': 'top',
              '&:not(.MuiTableCell-paddingNone)': {
                padding: baseTheme.spacing(1),
              },
              '&:first-of-type': {
                color: baseTheme.palette.text.secondary,
              },
            },
          },
          head: {
            'backgroundColor':
              baseTheme.palette.mode === 'light'
                ? baseTheme.palette.primary.dark
                : '#ffffff11',
            'color': baseTheme.palette.primary.contrastText,
            'whiteSpace': 'noWrap',
            '&:nth-of-type(1)': {
              borderTopLeftRadius: baseTheme.shape.borderRadius,
              borderBottomLeftRadius: baseTheme.shape.borderRadius / 2,
            },
            '&:nth-last-of-type(1)': {
              borderTopRightRadius: baseTheme.shape.borderRadius,
              borderBottomRightRadius: baseTheme.shape.borderRadius / 2,
            },
            [baseTheme.breakpoints.down('tablet')]: {
              padding: baseTheme.spacing(1),
            },
          },
          footer: {
            'backgroundColor':
              baseTheme.palette.mode === 'light' ? '#00000011' : '#ffffff11',
            '&:nth-of-type(1)': {
              borderTopLeftRadius: baseTheme.shape.borderRadius / 2,
              borderBottomLeftRadius: baseTheme.shape.borderRadius,
            },
            '&:nth-last-of-type(1)': {
              borderTopRightRadius: baseTheme.shape.borderRadius / 2,
              borderBottomRightRadius: baseTheme.shape.borderRadius,
            },
          },
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
      RosenNavigationBar: {
        styleOverrides: {
          root: {
            [baseTheme.breakpoints.down('tablet')]: {},
          },
        },
      },
      RosenApp: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette.secondary.dark,
            backgroundImage:
              baseTheme.palette.mode === 'light'
                ? `linear-gradient(180deg, ${baseTheme.palette.gradient.a} 0%, ${baseTheme.palette.gradient.b} 20%, ${baseTheme.palette.gradient.c} 40%, ${baseTheme.palette.gradient.d} 60%, ${baseTheme.palette.gradient.e} 80%, ${baseTheme.palette.gradient.f} 100%)`
                : 'none',
            [baseTheme.breakpoints.down('tablet')]: {
              backgroundImage:
                baseTheme.palette.mode === 'light'
                  ? `linear-gradient(90deg, ${baseTheme.palette.gradient.a} 0%, ${baseTheme.palette.gradient.b} 20%, ${baseTheme.palette.gradient.c} 40%, ${baseTheme.palette.gradient.d} 60%, ${baseTheme.palette.gradient.e} 80%, ${baseTheme.palette.gradient.f} 100%)`
                  : 'none',
            },
          },
          main: {
            paddingTop: baseTheme.shape.borderRadius,
            paddingBottom: baseTheme.shape.borderRadius * 3,
            paddingLeft: baseTheme.shape.borderRadius * 2,
            paddingRight: baseTheme.shape.borderRadius * 2,
            [baseTheme.breakpoints.down('tablet')]: {
              backgroundColor: baseTheme.palette.background.paper,
              paddingBottom: baseTheme.shape.borderRadius * 6,
            },
          },
        },
      },
    },
  });

export const theme = {
  light: create(light),
  dark: create(dark),
};
