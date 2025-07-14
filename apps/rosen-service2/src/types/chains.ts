import { SUPPORTED_CHAINS } from '../constants';

export type ChainChoices = (typeof SUPPORTED_CHAINS)[number];

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
