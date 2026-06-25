import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { AllChainsConfigs } from './chains';
import { RosenService2BaseConfig } from './configs';

export * from './configs';
export * from './chains';
export * from './scanners';

export interface RosenService2Configs extends RosenService2BaseConfig {
  contracts: AllChainsConfigs;
}

export interface ErgoNetworkConfig {
  networkType: ErgoNetworkType;
  url: string;
}
