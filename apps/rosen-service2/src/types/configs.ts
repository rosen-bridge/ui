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
  logging: HealthCheckLogging;
  scanner: HealthCheckScanner;
  notification: HealthCheckNotification;
  updateInterval: number;
}

export interface HealthCheckNotification {
  discordWebHookUrl?: string;
  historyCleanupTimeout?: number;
  hasBeenUnstableForAWhileWindowDuration?: number;
  hasBeenUnknownForAWhileWindowDuration?: number;
}

export interface HealthCheckScanner {
  warnDiff: number;
  criticalDiff: number;
}

export interface HealthCheckLogging {
  maxErrors: number;
  maxWarns: number;
  duration: number;
}

export interface Chains {
  ergo: ChainsErgo;
  cardano: ChainsCardano;
  bitcoin: ChainsBitcoin;
  doge: ChainsDoge;
  ethereum: ChainsEthereum;
  binance: ChainsBinance;
  bitcoinRunes: ChainsBitcoinRunes;
}

export interface ChainsBitcoinRunes {
  active: boolean;
}

export interface ChainsBinance {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  rpc: ChainsBinanceRpc;
}

export interface ChainsBinanceRpc {
  url?: string;
  timeout?: number;
  authToken?: string;
  suffix?: string;
}

export interface ChainsEthereum {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  rpc: ChainsEthereumRpc;
}

export interface ChainsEthereumRpc {
  url?: string;
  timeout?: number;
  authToken?: string;
  suffix?: string;
}

export interface ChainsDoge {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpcSuffix?: string;
  rpc: ChainsDogeRpc[];
  esplora: ChainsDogeEsplora;
}

export interface ChainsDogeEsplora {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
  suffix?: string;
}

export interface ChainsDogeRpc {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface ChainsBitcoin {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpc: ChainsBitcoinRpc;
  esplora: ChainsBitcoinEsplora;
}

export interface ChainsBitcoinEsplora {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
  suffix?: string;
}

export interface ChainsBitcoinRpc {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
  suffix?: string;
}

export interface ChainsCardano {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'koios' | 'ogmios' | 'blockfrost';
  koios: ChainsCardanoKoios;
  blockfrost: ChainsCardanoBlockfrost;
  ogmios: ChainsCardanoOgmios;
}

export interface ChainsCardanoOgmios {
  address?: string;
  port?: number;
  initialSlot?: number;
  initialHash?: string;
  maxTryBlock?: number;
  useTls?: boolean;
  suffix?: string;
}

export interface ChainsCardanoBlockfrost {
  url?: string;
  projectId?: string;
  suffix?: string;
}

export interface ChainsCardanoKoios {
  url?: string;
  timeout?: number;
  authToken?: string;
  suffix?: string;
}

export interface ChainsErgo {
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'explorer' | 'node';
  node: ChainsErgoNode;
  explorer: ChainsErgoExplorer;
}

export interface ChainsErgoExplorer {
  url?: string;
}

export interface ChainsErgoNode {
  url?: string;
}

export interface Paths {
  tokens: string;
  contracts: string;
}
