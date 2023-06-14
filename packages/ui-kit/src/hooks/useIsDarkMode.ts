import { useTheme } from '../hooks/useTheme';

export const useIsDarkMode = () => {
  const theme = useTheme();
  return theme.palette.mode === 'dark';
};
