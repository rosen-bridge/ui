import { useMediaQuery } from './useMediaQuery';
import { useTheme } from './useTheme';

interface useResponsiveValueOptions<Desktop, Laptop, Tablet, Mobile> {
  desktop?: Desktop;
  laptop?: Laptop;
  tablet?: Tablet;
  mobile: Mobile;
}

/**
 *  this hook get an object with break points as key and arbitrary value for each breakpoint.
 *  depending on screen size and and current active break point it returns the value for the current active breakpoint
 *  if the input object don't have the value for the current breakpoint the previous break points value
 *  will be returned.
 *
 * @param data - an object with the break points as key and the value for that breakpoint for return.
 * the data object most have a mobile property for fallback, the remaining of the break points are optional.
 */
export const useResponsiveValue = <Desktop, Laptop, Tablet, Mobile>(
  data: useResponsiveValueOptions<Desktop, Laptop, Tablet, Mobile>
) => {
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('desktop'));
  const isLaptop = useMediaQuery(
    theme.breakpoints.between('laptop', 'desktop')
  );
  const isTablet = useMediaQuery(theme.breakpoints.between('tablet', 'laptop'));

  if (isTablet) return data.tablet || data.mobile;

  if (isLaptop) return data.laptop || data.tablet || data.mobile;

  if (isDesktop)
    return data.desktop || data.laptop || data.tablet || data.mobile;

  return data.mobile;
};
