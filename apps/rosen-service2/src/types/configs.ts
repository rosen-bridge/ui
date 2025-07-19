export interface RosenService2Config {
  chains: Chains;
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
