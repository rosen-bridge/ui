import type { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import type { AllChainsConfigs } from './chains';
import type { RosenService2BaseConfig } from './configs';

export * from './chains';
export * from './configs';
export * from './scanners';

export interface RosenService2Configs extends RosenService2BaseConfig {
  contracts: AllChainsConfigs;
}

export interface ErgoNetworkConfig {
  networkType: ErgoNetworkType;
  url: string;
}
