export interface RosenService2BaseConfig {
  paths: Paths;
  chains: Chains;
  statistics: Statistics;
  tokenMap: TokenMap;
  dataAggregator: DataAggregator;
  healthCheck: HealthCheck;
  redis: Redis;
  db: Db;
  logs: (LogsOption0 | LogsOption1 | LogsOption2)[];
}

export interface LogsOption0 {
  type: 'file';
  maxSize: string;
  maxFiles: string;
  path: string;
  level: string;
  format?: 'plain' | 'json';
  serviceName?: string;
  createSymlink?: boolean;
  symlinkName?: string;
}

export interface LogsOption1 {
  type: 'console';
  level: string;
}

export interface LogsOption2 {
  type: 'loki';
  serviceName: string;
  host: string;
  basicAuth?: string;
  level: string;
}

export interface Db {
  url: string;
  logging?: boolean;
  useSSL?: boolean;
}

export interface Redis {
  address: string;
  token: string;
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

export interface DataAggregator {
  interval: number;
}

export interface TokenMap {
  onChainTokenMapEnabled: boolean;
  path?: string;
}

export interface Statistics {
  lockedAssetsMetrics: StatisticsLockedAssetsMetrics;
  generalMetrics: StatisticsGeneralMetrics;
  eventCountMetrics: StatisticsEventCountMetrics;
  userEventsMetric: StatisticsUserEventsMetric;
  watcherCountMetrics: StatisticsWatcherCountMetrics;
  bridgeFeeMetrics: StatisticsBridgeFeeMetrics;
  bridgeAmountMetrics: StatisticsBridgeAmountMetrics;
}

export interface StatisticsBridgeAmountMetrics {
  interval: number;
}

export interface StatisticsBridgeFeeMetrics {
  interval: number;
}

export interface StatisticsWatcherCountMetrics {
  interval: number;
  nodeUrl: string;
}

export interface StatisticsUserEventsMetric {
  interval: number;
}

export interface StatisticsEventCountMetrics {
  interval: number;
}

export interface StatisticsGeneralMetrics {
  interval: number;
}

export interface StatisticsLockedAssetsMetrics {
  interval: number;
}

export interface Chains {
  ergo: ChainsErgo;
  cardano: ChainsCardano;
  bitcoin: ChainsBitcoin;
  'bitcoin-runes': ChainsBitcoinRunes;
  doge: ChainsDoge;
  ethereum: ChainsEthereum;
  binance: ChainsBinance;
  firo: ChainsFiro;
  handshake: ChainsHandshake;
}

export interface ChainsHandshake {
  active: boolean;
  initialHeight?: number;
  scanInterval: number;
  adapter: ChainsHandshakeAdapter;
  blockRetrieveGap?: number;
  rpc: ChainsHandshakeRpc;
  blockCleanupConfig: ChainsHandshakeBlockCleanupConfig;
}

export interface ChainsHandshakeBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsHandshakeRpc {
  connections: ChainsHandshakeRpcConnections[];
}

export interface ChainsHandshakeRpcConnections {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface ChainsHandshakeAdapter {
  extraAddresses: string[];
}

export interface ChainsFiro {
  active: boolean;
  initialHeight?: number;
  scanInterval: number;
  adapter: ChainsFiroAdapter;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'electrumx';
  rpc: ChainsFiroRpc;
  electrumx: ChainsFiroElectrumx;
  blockCleanupConfig: ChainsFiroBlockCleanupConfig;
}

export interface ChainsFiroBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsFiroElectrumx {
  host?: string;
  port?: number;
  reconnectDelay?: number;
  timeout?: number;
}

export interface ChainsFiroRpc {
  connections: ChainsFiroRpcConnections[];
}

export interface ChainsFiroRpcConnections {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface ChainsFiroAdapter {
  extraAddresses: string[];
}

export interface ChainsBinance {
  active: boolean;
  initialHeight?: number;
  scanInterval: number;
  adapter: ChainsBinanceAdapter;
  blockRetrieveGap?: number;
  rpc: ChainsBinanceRpc;
  blockCleanupConfig: ChainsBinanceBlockCleanupConfig;
}

export interface ChainsBinanceBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsBinanceRpc {
  connections: ChainsBinanceRpcConnections[];
}

export interface ChainsBinanceRpcConnections {
  url?: string;
  timeout?: number;
  authToken?: string;
}

export interface ChainsBinanceAdapter {
  extraAddresses: string[];
  chunkSize?: number;
}

export interface ChainsEthereum {
  active: boolean;
  initialHeight?: number;
  scanInterval: number;
  adapter: ChainsEthereumAdapter;
  blockRetrieveGap?: number;
  rpc: ChainsEthereumRpc;
  blockCleanupConfig: ChainsEthereumBlockCleanupConfig;
}

export interface ChainsEthereumBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsEthereumRpc {
  connections: ChainsEthereumRpcConnections[];
}

export interface ChainsEthereumRpcConnections {
  url?: string;
  timeout?: number;
  authToken?: string;
}

export interface ChainsEthereumAdapter {
  extraAddresses: string[];
  chunkSize?: number;
}

export interface ChainsDoge {
  active: boolean;
  initialHeight?: number;
  scanInterval: number;
  adapter: ChainsDogeAdapter;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpc: ChainsDogeRpc;
  esplora: ChainsDogeEsplora;
  blockCleanupConfig: ChainsDogeBlockCleanupConfig;
}

export interface ChainsDogeBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsDogeEsplora {
  connections: ChainsDogeEsploraConnections[];
}

export interface ChainsDogeEsploraConnections {
  url?: string;
  timeout?: number;
  apiPrefix?: string;
}

export interface ChainsDogeRpc {
  connections: ChainsDogeRpcConnections[];
}

export interface ChainsDogeRpcConnections {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface ChainsDogeAdapter {
  extraAddresses: string[];
  blockCypher: ChainsDogeAdapterBlockCypher;
}

export interface ChainsDogeAdapterBlockCypher {
  url: string;
}

export interface ChainsBitcoinRunes {
  active: boolean;
  adapter: ChainsBitcoinRunesAdapter;
  unisatUrl?: string;
  unisatApiKey?: string;
}

export interface ChainsBitcoinRunesAdapter {
  extraAddresses: string[];
}

export interface ChainsBitcoin {
  active: boolean;
  initialHeight?: number;
  scanInterval: number;
  adapter: ChainsBitcoinAdapter;
  blockRetrieveGap?: number;
  method?: 'rpc' | 'esplora';
  rpc: ChainsBitcoinRpc;
  esplora: ChainsBitcoinEsplora;
  blockCleanupConfig: ChainsBitcoinBlockCleanupConfig;
}

export interface ChainsBitcoinBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsBitcoinEsplora {
  connections: ChainsBitcoinEsploraConnections[];
}

export interface ChainsBitcoinEsploraConnections {
  url: string;
  timeout?: number;
  apiPrefix?: string;
}

export interface ChainsBitcoinRpc {
  connections: ChainsBitcoinRpcConnections[];
}

export interface ChainsBitcoinRpcConnections {
  url?: string;
  timeout?: number;
  username?: string;
  password?: string;
}

export interface ChainsBitcoinAdapter {
  extraAddresses: string[];
}

export interface ChainsCardano {
  active: boolean;
  scanInterval: number;
  adapter: ChainsCardanoAdapter;
  blockRetrieveGap?: number;
  method?: 'koios' | 'ogmios' | 'blockfrost';
  initialHeight?: number;
  koios: ChainsCardanoKoios;
  blockfrost: ChainsCardanoBlockfrost;
  ogmios: ChainsCardanoOgmios;
  blockCleanupConfig: ChainsCardanoBlockCleanupConfig;
}

export interface ChainsCardanoBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsCardanoOgmios {
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
  connections: ChainsCardanoBlockfrostConnections[];
}

export interface ChainsCardanoBlockfrostConnections {
  url?: string;
  projectId?: string;
}

export interface ChainsCardanoKoios {
  connections: ChainsCardanoKoiosConnections[];
}

export interface ChainsCardanoKoiosConnections {
  url: string;
  timeout?: number;
  authToken?: string;
}

export interface ChainsCardanoAdapter {
  extraAddresses: string[];
}

export interface ChainsErgo {
  initialHeight: number;
  scanInterval: number;
  adapter: ChainsErgoAdapter;
  blockRetrieveGap?: number;
  method?: 'explorer' | 'node';
  node: ChainsErgoNode;
  explorer: ChainsErgoExplorer;
  blockCleanupConfig: ChainsErgoBlockCleanupConfig;
}

export interface ChainsErgoBlockCleanupConfig {
  blockCleanupThresholdDuration: number;
  blockTrimCountInRound: number;
}

export interface ChainsErgoExplorer {
  connections: ChainsErgoExplorerConnections[];
}

export interface ChainsErgoExplorerConnections {
  url: string;
}

export interface ChainsErgoNode {
  connections: ChainsErgoNodeConnections[];
}

export interface ChainsErgoNodeConnections {
  url?: string;
}

export interface ChainsErgoAdapter {
  extraAddresses: string[];
}

export interface Paths {
  contracts: string;
  healthReport: string;
}
