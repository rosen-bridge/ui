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
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
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
    RWTRepo: string;
    WatcherPermit: string;
    Fraud: string;
    lock: string;
    cold: string;
    guardSign: string;
    Commitment: string;
    WatcherTriggerEvent: string;
    WatcherCollateral: string;
    RepoConfig: string;
    Emission: string;
  };
  tokens: {
    RepoNFT: string;
    GuardNFT: string;
    RSN: string;
    RSNRatioNFT: string;
    EmissionNFT: string;
    ERSN: string;
    CleanupNFT: string;
    RWTId: string;
    AwcNFT: string;
    RepoConfigNFT: string;
  };
  cleanupConfirm: number;
}
