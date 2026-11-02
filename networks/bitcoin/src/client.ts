import { Bitcoin as BitcoinIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './generateLockTx';
import type { submitTransaction } from './utils';

type BitcoinNetworkConfig = NetworkConfig & {
  generateLockTx: ReturnType<typeof generateLockTx>;
  submitTransaction: typeof submitTransaction;
};

export class BitcoinNetwork extends Network<BitcoinNetworkConfig> {
  public label = NETWORKS.bitcoin.label;

  public logo = BitcoinIcon;

  public name = NETWORKS.bitcoin.key;

  public generateLockTx: BitcoinNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };

  public submitTransaction: BitcoinNetworkConfig['submitTransaction'] = (...args) => {
    return this.config.submitTransaction(...args);
  };
}
