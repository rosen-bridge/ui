import type { AllChainsConfigs } from './chains';
import type { RosenServiceBaseConfig } from './configs';

export * from './chains';
export * from './configs';
export * from './scanners';

export interface RosenServiceConfigs extends RosenServiceBaseConfig {
  contracts: AllChainsConfigs;
}
