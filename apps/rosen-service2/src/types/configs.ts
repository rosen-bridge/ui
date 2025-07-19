export interface RosenService2Config {
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
  host?: string;
}

export interface Db {
  host?: string;
  port: number;
  user: string;
  password?: string;
  name: string;
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
  rescanDelaySeconds: number;
  url: string;
}
