import { ChainConfigs } from './chains';
import { RoseService2Config } from './configs';

export * from './configs';
export * from './chains';

export interface RoseService2Configs extends RoseService2Config {
  contracts: {
    [key: string]: ChainConfigs;
  };
}
