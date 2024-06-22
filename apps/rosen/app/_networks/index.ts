export * from './bitcoin';
export * from './cardano';
export * from './ergo';

import { Networks } from '@/_constants';

export type AvailableNetworks = keyof typeof Networks;
