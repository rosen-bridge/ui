import { Handshake as HandshakeIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateUnsignedTx } from './generateUnsignedTx';
import type {
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from './utils';

type HandshakeNetworkConfig = NetworkConfig & {
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  getAddressBalance: typeof getAddressBalance;
  submitTransaction: typeof submitTransaction;
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

  public generateOpReturnData: HandshakeNetworkConfig['generateOpReturnData'] =
    (...args) => {
      return this.config.generateOpReturnData(...args);
    };

  public generateUnsignedTx: HandshakeNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getAddressBalance: HandshakeNetworkConfig['getAddressBalance'] = (
    ...args
  ) => {
    return this.config.getAddressBalance(...args);
  };

  public getMaxTransfer: HandshakeNetworkConfig['getMaxTransfer'] = (
    ...args
  ) => {
    return this.config.getMaxTransfer(...args);
  };

  public getMinTransfer: HandshakeNetworkConfig['getMinTransfer'] = (
    ...args
  ) => {
    return this.config.getMinTransfer(...args);
  };

  public submitTransaction: HandshakeNetworkConfig['submitTransaction'] = (
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
