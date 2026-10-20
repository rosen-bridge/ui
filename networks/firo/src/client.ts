import { Firo as FiroIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './utils';

type FiroNetworkConfig = Omit<NetworkConfig, 'getMaxTransfer'> & {
  generateLockTx: typeof generateLockTx;
};

export class FiroNetwork extends Network<FiroNetworkConfig> {
  public label = NETWORKS.firo.label;

  public logo = FiroIcon;

  public name = NETWORKS.firo.key;

  public generateLockTx: FiroNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };
}
