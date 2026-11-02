import { Ethereum as EthereumIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import type { generateLockTx } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

type EthereumNetworkConfig = NetworkConfig & {
  generateLockTx: ReturnType<typeof generateLockTx>;
};

export class EthereumNetwork extends Network<EthereumNetworkConfig> {
  public label = NETWORKS.ethereum.label;

  public logo = EthereumIcon;

  public name = NETWORKS.ethereum.key;

  public generateLockTx: EthereumNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address.toLowerCase();
  };
}
