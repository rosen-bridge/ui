interface ChainConfig {
  initialHeight: number;
  addresses: {
    lock: string;
    WatcherTriggerEvent: string;
    WatcherPermit: string;
    Fraud: string;
  };
  tokens: {
    RWTId: string;
  };
}

export interface ErgoChainConfig extends ChainConfig {
  explorerUrl: string;
}

export interface BitcoinChainConfig extends ChainConfig {
  esploraUrl: string;
  rpc: {
    url: string;
    username: string;
    password: string;
  };
}

export interface EthereumChainConfig extends ChainConfig {
  rpcUrl: string;
}

export interface BinanceChainConfig extends ChainConfig {
  rpcUrl: string;
}

export interface CardanoChainConfig extends ChainConfig {
  koiosUrl: string;
  koiosAuthToken: string;
}

export interface DogeChainConfig extends ChainConfig {
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
