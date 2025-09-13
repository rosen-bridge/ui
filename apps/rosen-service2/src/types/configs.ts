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
}

export interface ChainsBinance {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  rpc: ChainsBinanceRpc;
}

export interface ChainsBinanceRpc {
  suffix?: string;
  connections: ChainsBinanceRpcConnections[];
}

export interface ChainsBinanceRpcConnections {
  url?: string;
  timeout?: number;
  authToken?: string;
}

export interface ChainsEthereum {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  rpc: ChainsEthereumRpc;
}

export interface ChainsEthereumRpc {
  suffix?: string;
  connections: ChainsEthereumRpcConnections[];
}

export interface ChainsEthereumRpcConnections {
  url?: string;
  timeout?: number;
  authToken?: string;
}

export interface ChainsDoge {
  active: boolean;
  initialHeight: number;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpc: ChainsDogeRpc;
  esplora: ChainsDogeEsplora;
}

export interface ChainsDogeEsplora {
  suffix?: string;
  connections: ChainsDogeEsploraConnections[];
}

export interface ChainsDogeEsploraConnections {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
}

export interface ChainsDogeRpc {
  suffix?: string;
  connections: ChainsDogeRpcConnections[];
}

export interface ChainsDogeRpcConnections {
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
  suffix?: string;
  connections: ChainsBitcoinEsploraConnections[];
}

export interface ChainsBitcoinEsploraConnections {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
}

export interface ChainsBitcoinRpc {
  suffix?: string;
  connections: ChainsBitcoinRpcConnections[];
}

export interface ChainsBitcoinRpcConnections {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface ChainsCardano {
  active: boolean;
  scanInterval: number;
  blockRetrieveGap?: number;
  method?: 'koios' | 'ogmios' | 'blockfrost';
  initialHeight?: number;
  koios: ChainsCardanoKoios;
  blockfrost: ChainsCardanoBlockfrost;
  ogmios: ChainsCardanoOgmios;
}

export interface ChainsCardanoOgmios {
  suffix?: string;
  connection: ChainsCardanoOgmiosConnection;
}

export interface ChainsCardanoOgmiosConnection {
  address?: string;
  port?: number;
  initialSlot?: number;
  initialHash?: string;
  maxTryBlock?: number;
  useTls?: boolean;
}

export interface ChainsCardanoBlockfrost {
  suffix?: string;
  connections: ChainsCardanoBlockfrostConnections[];
}

export interface ChainsCardanoBlockfrostConnections {
  url?: string;
  projectId?: string;
}

export interface ChainsCardanoKoios {
  suffix?: string;
  connections: ChainsCardanoKoiosConnections[];
}

export interface ChainsCardanoKoiosConnections {
  url?: string;
  timeout?: number;
  authToken?: string;
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
  suffix?: string;
  connections: ChainsErgoExplorerConnections[];
}

export interface ChainsErgoExplorerConnections {
  url?: string;
}

export interface ChainsErgoNode {
  suffix?: string;
  connections: ChainsErgoNodeConnections[];
}

export interface ChainsErgoNodeConnections {
  url?: string;
}

export interface Paths {
  tokens: string;
  contracts: string;
  healthReport: string;
}
