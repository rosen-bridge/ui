import { Theme } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

interface ThemeProviderProps {
  children: JSX.Element;
  theme: Theme;
}

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => (
  <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
);

export type { ThemeProviderProps };
export default ThemeProvider;
