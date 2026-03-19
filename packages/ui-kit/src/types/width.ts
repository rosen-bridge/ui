import { OverridableValue } from './overridableValue';

export type Width = (number & {}) | (string & {});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WidthOverrides {}

export type WidthOverridden = OverridableValue<Width, WidthOverrides>;
