import { Breakpoint } from "@/types";
import { useMediaQuery, useTheme } from "@mui/material";

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

export const useResponsive: UseResponsive = <T>(data: ResponsiveInput<T> ): T | undefined => {
  const theme = useTheme();

  let result: T | undefined;

  for (let i = 0; i < BREAKPOINT_ORDER.length; i++) {
    const match = useMediaQuery(theme.breakpoints.up(BREAKPOINT_ORDER[i]));

    if (!match) continue;

    const value = data[BREAKPOINT_ORDER[i]];

    if (value === undefined) continue;

    result = Object.assign({}, result, value);

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result = { ...result, ...value };
    } else {
      result = value;
    }

  }

  return result;
};
