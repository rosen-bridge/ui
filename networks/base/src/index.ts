import { Network as NetworkName, RosenAmountValue } from '@rosen-ui/types';

import { calculateFeeCreator } from './calculateFeeCreator';

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
  calculateFee: ReturnType<typeof calculateFeeCreator>;
  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;
  validateAddress(chain: NetworkName, walletAddress: string): Promise<boolean>;
}

export interface Network {
  label: string;

  lockAddress: string;

  logo: string;

  name: NetworkName;

  nextHeightInterval: number;

  calculateFee: ReturnType<typeof calculateFeeCreator>;

  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;

  toSafeAddress(address: string): string;

  validateAddress(walletAddress: string): Promise<boolean>;
}

export * from './calculateFeeCreator';
export * from './validateAddress';
