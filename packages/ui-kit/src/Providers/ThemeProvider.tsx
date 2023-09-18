import { Theme } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import SnackbarProvider from '../contexts/snackbarContext';

import { AppSnackbar } from '../components';
interface ThemeProviderProps {
  children: JSX.Element;
  theme: Theme;
}

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => (
  <MuiThemeProvider theme={theme}>
    <SnackbarProvider>
      {children}
      <AppSnackbar />
    </SnackbarProvider>
  </MuiThemeProvider>
);

export type { ThemeProviderProps };
export default ThemeProvider;
