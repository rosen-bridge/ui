import { useMediaQuery } from './useMediaQuery';
import { useTheme } from './useTheme';

/**
 * @description returns true if the app is on mobile screen size
 */
export const useIsMobile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  return isMobile;
};
