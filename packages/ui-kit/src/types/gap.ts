import type { OverridableValue } from './overridableValue';

export interface GapOverrides {}

export type Gap = OverridableValue<(number & {}) | (string & {}), GapOverrides>;
