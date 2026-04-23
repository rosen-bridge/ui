import { Base as BaseIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { generateLockData, generateTxParameters } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

type BaseNetworkConfig = NetworkConfig & {
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};

class BaseNetwork implements Network {
  public label = NETWORKS.base.label;

  public lockAddress: string;

  public logo = BaseIcon;

  public name = NETWORKS.base.key;

  public nextHeightInterval: number;

  constructor(protected config: BaseNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: BaseNetworkConfig['calculateFee'] = (...args) => {
    return this.config.calculateFee(...args);
  };

  public generateLockData: BaseNetworkConfig['generateLockData'] = (
    ...args
  ) => {
    return this.config.generateLockData(...args);
  };

  public generateTxParameters: BaseNetworkConfig['generateTxParameters'] = (
    ...args
  ) => {
    return this.config.generateTxParameters(...args);
  };

  public getMaxTransfer: BaseNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public getMinTransfer: BaseNetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address.toLowerCase();
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}

export const base = new BaseNetwork({
  lockAddress: LOCK_ADDRESSES.base,
  nextHeightInterval: 50,
  ...unwrapFromObject(actions),
});
