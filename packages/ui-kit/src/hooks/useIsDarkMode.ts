import { useTheme } from '../hooks/useTheme';

/**
 * @description - returns true if the dark mode is active
 */
export const useIsDarkMode = () => {
  const theme = useTheme();
  return theme.palette.mode === 'dark';
};
