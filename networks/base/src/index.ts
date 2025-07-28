import { Network as NetworkName, RosenAmountValue } from '@rosen-ui/types';

export interface NetworkMaxTransferParams {
  balance: RosenAmountValue;
  isNative: boolean;
  eventData: {
    toChain: NetworkName;
    fromAddress: string;
    toAddress: string;
  };
}

export interface NetworkConfig {
  nextHeightInterval: number;
  lockAddress: string;
  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;
  validateAddress(chain: NetworkName, walletAddress: string): Promise<boolean>;
}

export interface Network {
  label: string;

  lockAddress: string;

  logo: string;

  name: NetworkName;

  nextHeightInterval: number;

  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;

  toSafeAddress(address: string): string;

  validateAddress(walletAddress: string): Promise<boolean>;
}

export * from './validateAddress';
