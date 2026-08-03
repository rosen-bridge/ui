import type { OverridableValue } from './overridableValue';

export interface WidthOverrides {}

export type Width = OverridableValue<
  (number & {}) | (string & {}),
  WidthOverrides
>;
