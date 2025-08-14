import { ChainConfigs } from './chains';
import { RosenService2BaseConfig } from './configs';

export * from './configs';
export * from './chains';

export interface RosenService2Configs extends RosenService2BaseConfig {
  contracts: {
    [key: string]: ChainConfigs;
  };
}
