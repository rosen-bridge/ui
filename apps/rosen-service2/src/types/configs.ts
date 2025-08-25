export interface RosenService2BaseConfig {
  paths: Paths;
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
}

export interface Ethereum {
  active: boolean;
}

export interface Doge {
  active: boolean;
}

export interface Bitcoin {
  active: boolean;
}

export interface Cardano {
  active: boolean;
}

export interface Ergo {
  initialHeight: number;
  node: Node;
}

export interface Node {
  blockRetrieveGap: number;
  scanInterval: number;
  url: string;
}

export interface Paths {
  tokens: string;
  contracts: string;
}
