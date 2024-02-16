import { Breakpoint } from '@mui/material';

import { useMediaQuery } from './useMediaQuery';
import { useTheme } from './useTheme';

import type { ResponsiveValueOptionsBase } from '../@types';

type UseResponsiveValueOptions<
  T,
  MandatoryBreakpoint extends Breakpoint = 'mobile',
> = {
  [Key in MandatoryBreakpoint]: NonNullable<T>;
} & ResponsiveValueOptionsBase<T>;

/**
 *  this hook get an object with break points as key and arbitrary value for each breakpoint.
 *  depending on screen size and and current active break point it returns the value for the current active breakpoint
 *  if the input object doesn't  have the value for the current breakpoint the previous break points value
 *  will be returned.
 *
 * @param data - an object with the break points as key and the value for that breakpoint for return.
 * the data object must have a mobile property for fallback, the remaining of the break points are optional.
 */

export const useResponsiveValue = <
  const T extends UseResponsiveValueOptions<T[keyof T]>,
>(
  data: T,
) => {
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('desktop'));
  const isLaptop = useMediaQuery(
    theme.breakpoints.between('laptop', 'desktop'),
  );
  const isTablet = useMediaQuery(theme.breakpoints.between('tablet', 'laptop'));

  if (isDesktop)
    return data.desktop || data.laptop || data.tablet || data.mobile;

  if (isLaptop) return data.laptop || data.tablet || data.mobile;

  if (isTablet) return data.tablet || data.mobile;

  return data.mobile;
};
