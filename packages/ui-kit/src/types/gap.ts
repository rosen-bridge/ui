import { OverridableValue } from './overridableValue';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GapOverrides {}

export type Gap = OverridableValue<(number & {}) | (string & {}), GapOverrides>;
