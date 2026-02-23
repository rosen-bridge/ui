import { OverridableValue } from './overridableValue';

export type Gap = (number & {}) | (string & {});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GapOverrides {}

export type GapOverridden = OverridableValue<Gap, GapOverrides>;
