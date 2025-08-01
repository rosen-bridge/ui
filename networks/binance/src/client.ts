import { Binance as BinanceIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { generateLockData, generateTxParameters } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

type BinanceNetworkConfig = NetworkConfig & {
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};

export class BinanceNetwork implements Network {
  public label = NETWORKS.binance.label;

  public lockAddress: string;

  public logo = BinanceIcon;

  public name = NETWORKS.binance.key;

  public nextHeightInterval: number;

  constructor(protected config: BinanceNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public generateLockData: BinanceNetworkConfig['generateLockData'] = (
    ...args
  ) => {
    return this.config.generateLockData(...args);
  };

  public generateTxParameters: BinanceNetworkConfig['generateTxParameters'] = (
    ...args
  ) => {
    return this.config.generateTxParameters(...args);
  };

  public getMaxTransfer: BinanceNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address.toLowerCase();
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
