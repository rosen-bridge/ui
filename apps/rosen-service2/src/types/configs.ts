export interface RosenService2BaseConfig {
  chains: Chains;
  healthCheck: HealthCheck;
  db: Db;
  logs: Logs[];
}

export interface Logs {
  type: 'file' | 'console' | 'loki';
  maxSize?: string;
  maxFiles?: string;
  path?: string;
  level: string;
  serviceName?: string;
  host?: string;
  basicAuth?: string;
}

export interface Db {
  host: string;
  port: number;
  username?: string;
  password?: string;
  name: string;
}

export interface HealthCheck {
  logging: Logging;
  scanner: Scanner;
  notification: Notification;
  updateInterval: number;
}

export interface Notification {
  discordWebHookUrl?: string;
  historyCleanupTimeout?: number;
  hasBeenUnstableForAWhileWindowDuration?: number;
  hasBeenUnknownForAWhileWindowDuration?: number;
}

export interface Scanner {
  warnDiff: number;
  criticalDiff: number;
}

export interface Logging {
  maxErrors: number;
  maxWarns: number;
  duration: number;
}

export interface Chains {
  ergo: Ergo;
  cardano: Cardano;
  bitcoin: Bitcoin;
  doge: Doge;
  ethereum: Ethereum;
  binance: Binance;
  runes: Runes;
}

export interface Runes {
  active: boolean;
}

export interface Binance {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  rpc: Rpc1;
}

export interface Rpc1 {
  url: string;
  timeout: number;
  authToken?: string;
  suffix?: string;
}

export interface Ethereum {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  rpc: Rpc2;
}

export interface Rpc2 {
  url: string;
  timeout: number;
  authToken?: string;
  suffix?: string;
}

export interface Doge {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpcSuffix?: string;
  rpc: Rpc3[];
  esplora: Esplora1;
}

export interface Esplora1 {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
  suffix?: string;
}

export interface Rpc3 {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface Bitcoin {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpc: Rpc;
  esplora: Esplora;
}

export interface Esplora {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
  suffix?: string;
}

export interface Rpc {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
  suffix?: string;
}

export interface Cardano {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'koios' | 'ogmios' | 'blockfrost';
  koios: Koios;
  blockfrost: Blockfrost;
  ogmios: Ogmios;
}

export interface Ogmios {
  address?: string;
  port?: number;
  initialSlot?: number;
  initialHash?: string;
  maxTryBlock?: number;
  useTls?: boolean;
  suffix?: string;
}

export interface Blockfrost {
  url?: string;
  projectId?: string;
  suffix?: string;
}

export interface Koios {
  url?: string;
  timeout?: number;
  authToken?: string;
  suffix?: string;
}

export interface Ergo {
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'explorer' | 'node';
  node: Node;
  explorer: Explorer;
}

export interface Explorer {
  url?: string;
}

export interface Node {
  url?: string;
}
