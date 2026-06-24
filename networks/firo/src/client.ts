import { Firo as FiroIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateUnsignedTx } from './generateUnsignedTx';
import type {
  buildPaymentUri,
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from './utils';

type MaybePromise<T> = T | Promise<T>;

type FiroNetworkConfig = NetworkConfig & {
  buildPaymentUri: (
    ...args: Parameters<typeof buildPaymentUri>
  ) => MaybePromise<ReturnType<typeof buildPaymentUri>>;
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  getAddressBalance: typeof getAddressBalance;
  submitTransaction: typeof submitTransaction;
};

export class FiroNetwork implements Network {
  public label = NETWORKS.firo.label;

  public lockAddress: string;

  public logo = FiroIcon;

  public name = NETWORKS.firo.key;

  public nextHeightInterval: number;

  constructor(protected config: FiroNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: FiroNetworkConfig['calculateFee'] = (...args) => {
    return this.config.calculateFee(...args);
  };

  public buildPaymentUri: FiroNetworkConfig['buildPaymentUri'] = (...args) => {
    return this.config.buildPaymentUri(...args);
  };

  public generateOpReturnData: FiroNetworkConfig['generateOpReturnData'] = (
    ...args
  ) => {
    return this.config.generateOpReturnData(...args);
  };

  public generateUnsignedTx: FiroNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getAddressBalance: FiroNetworkConfig['getAddressBalance'] = (
    ...args
  ) => {
    return this.config.getAddressBalance(...args);
  };

  public getMaxTransfer: FiroNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public getMinTransfer: FiroNetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public submitTransaction: FiroNetworkConfig['submitTransaction'] = (
    ...args
  ) => {
    return this.config.submitTransaction(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
