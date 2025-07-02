export type JsonType =
  | string
  | number
  | boolean
  | null
  | JsonType[]
  | { [key: string]: JsonType };

export interface ContractsConfig {
  lock: string;
  eventTrigger: string;
  permit: string;
  fraud: string;
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
      network: 'Mainnet' | 'Testnet';
      type: 'node' | 'explorer';
      fee: number;
      minBoxValue: number;
      mnemonic: string;
      initialHeight: number;
      explorer: {
        url: string;
        timeout: number;
      };
      node: {
        url: string;
        timeout: number;
      };
      transaction: {
        timeout: number;
        confirmation: number;
        commitmentTimeoutConfirmation: number;
      };
      interval: {
        scanner: number;
        revenue: number;
        transaction: number;
        tokenName: number;
        commitment: {
          creation: number;
          reveal: number;
          redeem: number;
        };
        wid: {
          status: number;
        };
        minimumFee: number;
      };
      contracts: ContractsConfig | undefined;
    };
    cardano: {
      active: boolean;
      type: 'koios' | 'ogmios' | 'blockfrost';
      initial: {
        slot: number;
        hash: string;
        height: number;
      };
      koios: {
        interval: number;
        timeout: number;
        url: string;
      };
      ogmios: {
        host: string;
        port: number;
        connectionRetrialInterval: number;
        useTls: false;
      };
      blockfrost: {
        url: string;
        projectId: string;
        timeout: number;
        interval: number;
      };
      contracts: ContractsConfig | undefined;
    };
    bitcoin: {
      active: boolean;
      type: 'esplora' | 'rpc';
      initialHeight: number;
      interval: number;
      esplora: {
        timeout: number;
        url: string;
      };
      rpc: {
        timeout: number;
        url: string;
      };
      contracts: ContractsConfig | undefined;
    };
    doge: {
      active: boolean;
      type: 'esplora' | 'rpc';
      initialHeight: number;
      interval: number;
      esplora: {
        url: string;
        timeout: number;
      }[];
      rpc: {
        url: string;
        timeout: number;
      }[];
      contracts: ContractsConfig | undefined;
    };
    ethereum: {
      active: boolean;
      type: string;
      initialHeight: number;
      interval: number;
      rpc: {
        url: string;
        interval: number;
        timeout: number;
      };
      contracts: ContractsConfig | undefined;
    };
    binance: {
      active: boolean;
      type: string;
      initialHeight: number;
      interval: number;
      rpc: {
        url: string;
        timeout: number;
      };
      contracts: ContractsConfig | undefined;
    };
  };
}
