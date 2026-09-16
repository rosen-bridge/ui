import { Handshake as HandshakeIcon } from '@rosen-bridge/icons';
import type { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateOpReturnData } from './utils';

type HandshakeNetworkConfig = Omit<NetworkConfig, 'getMaxTransfer'> & {
  generateOpReturnData: typeof generateOpReturnData;
};

export class HandshakeNetwork implements Network {
  public label = NETWORKS.handshake.label;

  public lockAddress: string;

  public logo = HandshakeIcon;

  public name = NETWORKS.handshake.key;

  public nextHeightInterval: number;

  constructor(protected config: HandshakeNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: HandshakeNetworkConfig['calculateFee'] = (...args) => {
    return this.config.calculateFee(...args);
  };

  public generateOpReturnData: HandshakeNetworkConfig['generateOpReturnData'] = (...args) => {
    return this.config.generateOpReturnData(...args);
  };

  public getMaxTransfer: Network['getMaxTransfer'] = async () => {
    return BigInt(Number.MAX_VALUE);
  };

  public getMinTransfer: HandshakeNetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
