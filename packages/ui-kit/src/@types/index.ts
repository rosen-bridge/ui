import { Breakpoint } from '@mui/material';

export type ResponsiveValueOptionsBase<T> = {
  [Key in Breakpoint]?: T;
};
