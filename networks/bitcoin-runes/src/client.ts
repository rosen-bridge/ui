import { BitcoinRunes as BitcoinRunesIcon } from '@rosen-bridge/icons';
import {
  Network,
  NetworkConfig,
  NetworkMaxTransferParams,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export class BitcoinRunesNetwork implements Network {
  public label = NETWORKS.bitcoinRunes.label;

  public lockAddress: string;

  public logo = BitcoinRunesIcon;

  public name = NETWORKS.bitcoinRunes.key;

  public nextHeightInterval: number;

  constructor(protected config: NetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public calculateFee: NetworkConfig['calculateFee'] = (...args) => {
    return this.config.calculateFee(...args);
  };

  public getMaxTransfer = (
    params: NetworkMaxTransferParams,
  ): Promise<RosenAmountValue> => {
    return this.config.getMaxTransfer(params);
  };

  public getMinTransfer: NetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
