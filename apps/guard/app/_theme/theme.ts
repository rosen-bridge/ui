import { Theme } from '@mui/material';
import { createTheme } from '@rosen-bridge/ui-kit';

declare module '@mui/material/styles' {}

const light = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#6cac9c',
      main: '#6cac9c',
      dark: '#438070',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffd8d2',
      main: '#fa9384',
      dark: '#e36b77',
      contrastText: '#fff',
    },
    info: {
      light: '#f1f5ff',
      main: '#5873de',
      dark: '#384d78',
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
      default: '#f7f7f7',
      paper: '#fff',
      shadow: '#00000033',
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
      light: '#6cac9c',
      main: '#6cac9c',
      dark: '#6cac9c',
      contrastText: '#fff',
    },
    secondary: {
      light: '#fa9384',
      main: '#71353b',
      dark: '#71353b',
      contrastText: '#fff',
    },
    info: {
      light: '#bdccff',
      main: '#2c396f',
      dark: '#132236',
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
      default: '#1a2f4b',
      paper: '#28475c',
      shadow: '#00000033',
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
            ? baseTheme.palette.info.dark
            : baseTheme.palette.info.light,
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
      MuiPagination: {
        defaultProps: {
          color: 'primary',
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette.background.paper,
            borderRadius: baseTheme.shape.borderRadius,
            [baseTheme.breakpoints.up('tablet')]: {
              padding: baseTheme.spacing(0, 2),
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            tableLayout: 'fixed',
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& tr.shaded': {
              backgroundColor:
                baseTheme.palette.mode === 'light'
                  ? baseTheme.palette.info.light
                  : baseTheme.palette.info.dark + '22',
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
              verticalAlign: 'top',
              '&:not(.MuiTableCell-paddingNone)': {
                padding: baseTheme.spacing(1),
              },
              '&:first-of-type': {
                color: baseTheme.palette.text.secondary,
              },
            },
          },
          head: {
            padding: baseTheme.spacing(1, 2),
            backgroundColor: baseTheme.palette.info.dark,
            color: baseTheme.palette.info.contrastText,
            whiteSpace: 'noWrap',
            [baseTheme.breakpoints.up('tablet')]: {
              '&:nth-of-type(1)': {
                borderBottomLeftRadius: baseTheme.shape.borderRadius / 2,
              },
              '&:nth-last-of-type(1)': {
                borderBottomRightRadius: baseTheme.shape.borderRadius / 2,
              },
            },
            [baseTheme.breakpoints.down('tablet')]: {
              '&:nth-of-type(1)': {
                borderTopLeftRadius: baseTheme.shape.borderRadius / 2,
              },
              '&:nth-last-of-type(1)': {
                borderTopRightRadius: baseTheme.shape.borderRadius / 2,
              },
            },
          },
          footer: {
            borderTop: `1px solid ${baseTheme.palette.divider}`,
          },
        },
      },
    },
  });

export const theme = {
  light: create(light),
  dark: create(dark),
};
