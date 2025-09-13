import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { configs } from '../configs';
import { BITCOIN_RUNES_KEY } from '../constants';

// TODO: implement Bitcoin-Runes support later
export type ChainChoices = Exclude<
  (typeof NETWORKS_KEYS)[number],
  typeof BITCOIN_RUNES_KEY
>;

export type ChainsKeys = keyof (typeof configs)['chains'];

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
