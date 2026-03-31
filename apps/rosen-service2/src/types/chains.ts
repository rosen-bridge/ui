import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { configs } from '../configs';

export type ChainChoices = (typeof NETWORKS_KEYS)[number];

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
  tokens: {
    RSN: string;
  };
} & {
  [K in ChainChoices]: ChainConfigs;
};
