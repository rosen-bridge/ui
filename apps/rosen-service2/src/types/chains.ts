import { NETWORKS_KEYS } from '@rosen-ui/constants';

import { configs } from '../configs';
import {
  ERGO_BLOCK_TIME,
  DOGE_BLOCK_TIME,
  CARDANO_BLOCK_TIME,
  BINANCE_BLOCK_TIME,
  BITCOIN_BLOCK_TIME,
  ETHEREUM_BLOCK_TIME,
} from '../constants';

export type ChainChoices = (typeof NETWORKS_KEYS)[number];

export type ChainsKeys = keyof (typeof configs)['chains'];
export type ChainsWithScanner = Exclude<ChainsKeys, 'bitcoin-runes'>;

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

export const BLOCK_TIMES: Record<ChainsWithScanner, number> = {
  ergo: ERGO_BLOCK_TIME,
  cardano: CARDANO_BLOCK_TIME,
  bitcoin: BITCOIN_BLOCK_TIME,
  doge: DOGE_BLOCK_TIME,
  ethereum: ETHEREUM_BLOCK_TIME,
  binance: BINANCE_BLOCK_TIME,
};
