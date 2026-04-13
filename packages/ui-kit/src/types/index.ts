import { Breakpoint } from './breakpoint';

export * from './breakpoint';
export * from './color';
export * from './gap';
export * from './overridableType';
export * from './overridableValue';
export * from './width';

export type ResponsiveValueOptionsBase<T> = {
  [Key in Breakpoint]?: T;
};
