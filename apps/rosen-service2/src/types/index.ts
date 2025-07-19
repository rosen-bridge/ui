import { ChainConfigs } from './chains';
import { RosenService2Config } from './configs';

export * from './configs';
export * from './chains';

export interface RosenService2Configs extends RosenService2Config {
  contracts: {
    [key: string]: ChainConfigs;
  };
}
