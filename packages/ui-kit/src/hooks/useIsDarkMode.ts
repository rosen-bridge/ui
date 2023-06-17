import { useTheme } from '../hooks/useTheme';

/**
 * returns true if the dark mode is active
 */
export const useIsDarkMode = () => {
  const theme = useTheme();
  return theme.palette.mode === 'dark';
};
