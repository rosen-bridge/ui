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
}

export interface Network {
  label: string;

  lockAddress: string;

  logo: string;

  name: NetworkName;

  nextHeightInterval: number;

  getMaxTransfer(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;

  toSafeAddress(address: string): string;
}
