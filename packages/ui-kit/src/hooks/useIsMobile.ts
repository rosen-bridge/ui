import { useMediaQuery } from './useMediaQuery';
import { useTheme } from './useTheme';

export const useIsMobile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  return isMobile;
};
