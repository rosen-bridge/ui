import { useMediaQuery, useTheme } from '@mui/material';

import type { Breakpoint } from '@/types';

const BREAKPOINT_ORDER: Breakpoint[] = [
  'mobile',
  'tablet',
  'laptop',
  'desktop',
];

type ResponsiveInput<T> = { [B in Breakpoint]?: T };

type UseResponsive = {
  <T>(data: ResponsiveInput<T> & { mobile: T }): T;
  <T>(data: ResponsiveInput<T>): T | undefined;
};

export const useResponsive: UseResponsive = <T>(
  data: ResponsiveInput<T>,
): T | undefined => {
  const theme = useTheme();

  const matches = [
    useMediaQuery(theme.breakpoints.up('mobile')),
    useMediaQuery(theme.breakpoints.up('tablet')),
    useMediaQuery(theme.breakpoints.up('laptop')),
    useMediaQuery(theme.breakpoints.up('desktop')),
  ];

  let result: T | undefined;

  for (let i = 0; i < matches.length; i++) {
    if (!matches[i]) continue;

    const value = data[BREAKPOINT_ORDER[i]];

    if (value === undefined) continue;

    result = Object.assign({}, result, value);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result = { ...result, ...value };
    } else {
      result = value;
    }
  }

  return result;
};
