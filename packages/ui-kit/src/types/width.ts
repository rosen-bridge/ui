import { OverridableValue } from './overridableValue';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WidthOverrides {}

export type Width = OverridableValue<
  (number & {}) | (string & {}),
  WidthOverrides
>;
