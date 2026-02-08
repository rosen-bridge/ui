import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { configs } from '../configs';
import { BITCOIN_RUNES_NETWORKS_KEY } from '../constants';

// TODO: implement Bitcoin-Runes support later
export type ChainChoices = Exclude<
  (typeof NETWORKS_KEYS)[number],
  typeof BITCOIN_RUNES_NETWORKS_KEY
>;

export type ChainsKeys = keyof (typeof configs)['chains'];

export interface ChainConfigs {
  addresses: {
    lock: string;
    cold: string;
    WatcherTriggerEvent: string;
    WatcherPermit: string;
    Fraud: string;
    tokenMap?: string;
  };
  tokens: {
    RWTId: string;
    tokenMap?: string;
  };
  cleanupConfirm: number;
}

export type AllChainsConfigs = {
  version: string;
} & {
  [K in ChainChoices]: ChainConfigs;
};
