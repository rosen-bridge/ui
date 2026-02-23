import { OverridableValue } from './overridableValue';

export type Color = string & {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColorOverrides {}

export type ColorOverridden = OverridableValue<Color, ColorOverrides>;
