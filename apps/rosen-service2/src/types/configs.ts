import { SUPPORTED_CHAINS } from '../constants';

export type ChainChoices = (typeof SUPPORTED_CHAINS)[number];

export interface ErgoChainConfig {
  initialHeight: number;
  node: {
    url: string;
    timeout: number;
  };
}

export interface BitcoinChainConfig {
  active: boolean;
  esploraUrl: string;
  rpc: {
    url: string;
    username: string;
    password: string;
  };
}

export interface EthereumChainConfig {
  active: boolean;
  rpcUrl: string;
}

export interface BinanceChainConfig {
  active: boolean;
  rpcUrl: string;
}

export interface CardanoChainConfig {
  active: boolean;
  koiosUrl: string;
  koiosAuthToken: string;
}

export interface DogeChainConfig {
  active: boolean;
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
    ergo: ErgoChainConfig | undefined;
    cardano: CardanoChainConfig;
    bitcoin: BitcoinChainConfig;
    doge: DogeChainConfig;
    ethereum: EthereumChainConfig;
    binance: BinanceChainConfig;
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
