import { Breakpoint } from '@mui/material';

export * from './color';
export * from './gap';
export * from './overridableType';
export * from './overridableValue';

export type ResponsiveValueOptionsBase<T> = {
  [Key in Breakpoint]?: T;
};
