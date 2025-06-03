import { Ethereum as EthereumIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { generateLockData, generateTxParameters } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

type EthereumNetworkConfig = NetworkConfig & {
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};

export class EthereumNetwork implements Network {
  public label = NETWORKS.ethereum.label;

  public lockAddress: string;

  public logo = EthereumIcon;

  public name = NETWORKS.ethereum.key;

  public nextHeightInterval: number;

  constructor(protected config: EthereumNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public generateLockData: EthereumNetworkConfig['generateLockData'] = (
    ...args
  ) => {
    return this.config.generateLockData(...args);
  };

  public generateTxParameters: EthereumNetworkConfig['generateTxParameters'] = (
    ...args
  ) => {
    return this.config.generateTxParameters(...args);
  };

  public getMaxTransfer: EthereumNetworkConfig['getMaxTransfer'] = (
    ...args
  ) => {
    return this.config.getMaxTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address.toLowerCase();
  };
}
