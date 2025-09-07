import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { configs } from '../configs';

export type ChainChoices = (typeof NETWORKS_KEYS)[number];

export type ChainsKeys = Exclude<
  keyof (typeof configs)['chains'],
  'bitcoinRunes'
>;

export interface ChainConfigs {
  version: string;
  addresses: {
    lock: string;
    WatcherTriggerEvent: string;
    WatcherPermit: string;
    Fraud: string;
  };
  tokens: {
    RWTId: string;
  };
  cleanupConfirm: number;
}
