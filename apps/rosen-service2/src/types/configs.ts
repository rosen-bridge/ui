import { NETWORKS_KEYS } from '@rosen-ui/constants';

export type ChainChoices = (typeof NETWORKS_KEYS)[number];

export interface ErgoChainConfig {
  explorerUrl: string;
}

export interface BitcoinChainConfig {
  esploraUrl: string;
  rpc: {
    url: string;
    username: string;
    password: string;
  };
}

export interface EthereumChainConfig {
  rpcUrl: string;
}

export interface BinanceChainConfig {
  rpcUrl: string;
}

export interface CardanoChainConfig {
  koiosUrl: string;
  koiosAuthToken: string;
}

export interface DogeChainConfig {
  blockcypherUrl: string;
  rpcConnections: {
    url: string;
    username: string;
    password: string;
  }[];
}

export interface Configs {
  logs: (
    | {
        type: 'file';
        maxSize: string;
        maxFiles: string;
        path: string;
        level: 'info' | 'debug' | 'warn' | 'error';
      }
    | {
        type: 'console';
        level: 'info' | 'debug' | 'warn' | 'error';
      }
  )[];
  chains: {
    ergo: {
      chainConfigs: ErgoChainConfig | undefined;
    };
    cardano: {
      active: boolean;
      chainConfigs: CardanoChainConfig | undefined;
    };
    bitcoin: {
      active: boolean;
      chainConfigs: BitcoinChainConfig | undefined;
    };
    doge: {
      active: boolean;
      chainConfigs: DogeChainConfig | undefined;
    };
    ethereum: {
      active: boolean;
      chainConfigs: EthereumChainConfig | undefined;
    };
    binance: {
      active: boolean;
      chainConfigs: BinanceChainConfig | undefined;
    };
  };
}

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
