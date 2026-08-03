import { Firo as FiroIcon } from '@rosen-bridge/icons';
import type { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { buildPaymentUri, generateOpReturnData } from './utils';

type MaybePromise<T> = T | Promise<T>;

type FiroNetworkConfig = Omit<NetworkConfig, 'getMaxTransfer'> & {
  buildPaymentUri: (
    ...args: Parameters<typeof buildPaymentUri>
  ) => MaybePromise<ReturnType<typeof buildPaymentUri>>;
  generateOpReturnData: typeof generateOpReturnData;
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

  public getMaxTransfer: Network['getMaxTransfer'] = async () => {
    return BigInt(Number.MAX_VALUE);
  };

  public getMinTransfer: FiroNetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
