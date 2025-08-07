import { Bitcoin as BitcoinIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateUnsignedTx } from './generateUnsignedTx';
import type {
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from './utils';

type BitcoinNetworkConfig = NetworkConfig & {
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  getAddressBalance: typeof getAddressBalance;
  submitTransaction: typeof submitTransaction;
};

export class BitcoinNetwork implements Network {
  public label = NETWORKS.bitcoin.label;

  public lockAddress: string;

  public logo = BitcoinIcon;

  public name = NETWORKS.bitcoin.key;

  public nextHeightInterval: number;

  constructor(protected config: BitcoinNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: BitcoinNetworkConfig['calculateFee'] = (...args) => {
    return this.config.calculateFee(...args);
  };

  public generateOpReturnData: BitcoinNetworkConfig['generateOpReturnData'] = (
    ...args
  ) => {
    return this.config.generateOpReturnData(...args);
  };

  public generateUnsignedTx: BitcoinNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getAddressBalance: BitcoinNetworkConfig['getAddressBalance'] = (
    ...args
  ) => {
    return this.config.getAddressBalance(...args);
  };

  public getMaxTransfer: BitcoinNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public getMinTransfer: BitcoinNetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public submitTransaction: BitcoinNetworkConfig['submitTransaction'] = (
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
