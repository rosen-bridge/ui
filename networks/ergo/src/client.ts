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

  public generateUnsignedTx: ErgoNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getMaxTransfer: ErgoNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };
}
