import { Ergo as ErgoIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './generateLockTx';

type ErgoNetworkConfig = NetworkConfig & {
  generateLockTx: ReturnType<typeof generateLockTx>;
};

export class ErgoNetwork extends Network<ErgoNetworkConfig> {
  public label = NETWORKS.ergo.label;

  public logo = ErgoIcon;

  public name = NETWORKS.ergo.key;

  public generateLockTx: ErgoNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };
}
