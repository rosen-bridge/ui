export interface RosenService2BaseConfig {
  chains: Chains;
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
  url: string;
  useSSL?: boolean;
  logging?: boolean;
}

export interface Chains {
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
