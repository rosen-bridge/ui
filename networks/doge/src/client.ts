import { Doge as DogeIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './generateLockTx';
import type { submitTransaction } from './utils';

type DogeNetworkConfig = NetworkConfig & {
  generateLockTx: ReturnType<typeof generateLockTx>;
  submitTransaction: typeof submitTransaction;
};

export class DogeNetwork extends Network<DogeNetworkConfig> {
  public label = NETWORKS.doge.label;

  public logo = DogeIcon;

  public name = NETWORKS.doge.key;

  public generateLockTx: DogeNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };

  public submitTransaction: DogeNetworkConfig['submitTransaction'] = (...args) => {
    return this.config.submitTransaction(...args);
  };
}
