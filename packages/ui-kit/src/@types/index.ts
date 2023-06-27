import { Breakpoint } from '@mui/material';

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ResponsiveValueOptionsBase<T> = {
  [Key in Breakpoint]?: T;
};
