import { BitcoinRunes as BitcoinRunesIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateUnsignedTx } from './generateUnsignedTx';
import type {
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from './utils';

type BitcoinRunesNetworkConfig = NetworkConfig & {
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  getAddressBalance: typeof getAddressBalance;
  submitTransaction: typeof submitTransaction;
};

export class BitcoinRunesNetwork implements Network {
  public label = NETWORKS['bitcoin-runes'].label;

  public lockAddress: string;

  public logo = BitcoinRunesIcon;

  public name = NETWORKS['bitcoin-runes'].key;

  public nextHeightInterval: number;

  constructor(protected config: BitcoinRunesNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: BitcoinRunesNetworkConfig['calculateFee'] = (
    ...args
  ) => {
    return this.config.calculateFee(...args);
  };

  public generateOpReturnData: BitcoinRunesNetworkConfig['generateOpReturnData'] =
    (...args) => {
      return this.config.generateOpReturnData(...args);
    };

  public generateUnsignedTx: BitcoinRunesNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getAddressBalance: BitcoinRunesNetworkConfig['getAddressBalance'] = (
    ...args
  ) => {
    return this.config.getAddressBalance(...args);
  };

  public getMaxTransfer: BitcoinRunesNetworkConfig['getMaxTransfer'] = (
    ...args
  ) => {
    return this.config.getMaxTransfer(...args);
  };

  public getMinTransfer: BitcoinRunesNetworkConfig['getMinTransfer'] = (
    ...args
  ) => {
    return this.config.getMinTransfer(...args);
  };

  public submitTransaction: BitcoinRunesNetworkConfig['submitTransaction'] = (
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
