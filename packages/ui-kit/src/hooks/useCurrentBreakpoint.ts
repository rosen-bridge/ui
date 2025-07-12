import { useTheme, useMediaQuery, Breakpoint } from '@mui/material';

/**
 * List of custom breakpoints.
 */

/**
 * Hook to detect the current breakpoint using MUI `useMediaQuery`.
 *
 * Returns one of: 'mobile', 'tablet', 'laptop', 'desktop'.
 *
 * @example
 *  const cb = useCurrentBreakpoint()
 *  return <div> current breakpoint is ${cb}</div>
 */
export const useCurrentBreakpoint = (): Breakpoint | undefined => {
  const theme = useTheme();

  const matches: Record<Breakpoint, boolean> = {
    mobile: useMediaQuery(theme.breakpoints.only('mobile')),
    tablet: useMediaQuery(theme.breakpoints.only('tablet')),
    laptop: useMediaQuery(theme.breakpoints.only('laptop')),
    desktop: useMediaQuery(theme.breakpoints.only('desktop')),
  };

  const current = Object.entries(matches).find(([, match]) => match);

  if (!current) return;

  return current[0] as Breakpoint;
};
