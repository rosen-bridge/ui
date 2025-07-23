import { NETWORKS_KEYS } from '@rosen-ui/constants';

export type ChainChoices = (typeof NETWORKS_KEYS)[number];

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
