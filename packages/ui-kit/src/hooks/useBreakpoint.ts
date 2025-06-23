import { Breakpoint } from '@mui/material';

import { useMediaQuery } from './useMediaQuery';
import { useTheme } from './useTheme';

export const useBreakpoint = (
  breakpoint:
    | Breakpoint
    | `${Breakpoint}-${'up' | 'down' | 'not'}`
    | `${Breakpoint}-to-${Breakpoint}`,
) => {
  const theme = useTheme();

  const keys = breakpoint.split('-');

  const args: string[] = [];

  args.push(keys[0]);

  if (keys[2]) {
    args.push(keys[2]);
  }

  const action = keys[1] == 'to' ? 'between' : keys[1] || 'only';

  const func = theme.breakpoints[action as keyof typeof theme.breakpoints] as (
    ...args: string[]
  ) => string;

  const query = func(...args);

  return useMediaQuery(query);
};
