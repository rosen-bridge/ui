import { Ergo as ErgoIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateUnsignedTx } from './generateUnsignedTx';

type ErgoNetworkConfig = NetworkConfig & {
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
};

export class ErgoNetwork implements Network {
  public label = NETWORKS.ergo.label;

  public lockAddress: string;

  public logo = ErgoIcon;

  public name = NETWORKS.ergo.key;

  public nextHeightInterval: number;

  constructor(protected config: ErgoNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: ErgoNetworkConfig['calculateFee'] = (...args) => {
    return this.config.calculateFee(...args);
  };

  public generateUnsignedTx: ErgoNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getMaxTransfer: ErgoNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public getMinTransfer: ErgoNetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
