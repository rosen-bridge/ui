import type { Network as NetworkName, RosenAmountValue } from '@rosen-ui/types';

import type { CalculateFee } from './calculateFeeCreator';
import type { getMinTransferCreator } from './getMinTransferCreator';

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
  calculateFee: CalculateFee;
  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;
  getMinTransfer: ReturnType<ReturnType<typeof getMinTransferCreator>>;
  validateAddress(chain: NetworkName, walletAddress: string): Promise<boolean>;
}

export interface Network {
  label: string;

  lockAddress: string;

  logo: string;

  name: NetworkName;

  nextHeightInterval: number;

  calculateFee: CalculateFee;

  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;

  getMinTransfer: ReturnType<ReturnType<typeof getMinTransferCreator>>;

  toSafeAddress(address: string): string;

  validateAddress(walletAddress: string): Promise<boolean>;
}

export * from './calculateFeeCreator';
export * from './getMinTransferCreator';
export * from './handleUncoveredAssets';
export * from './validateAddress';
