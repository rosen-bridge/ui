import { BitcoinRunes as BitcoinRunesIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './generateLockTx';
import type { submitTransaction } from './utils';

type BitcoinRunesNetworkConfig = NetworkConfig & {
  generateLockTx: ReturnType<typeof generateLockTx>;
  submitTransaction: typeof submitTransaction;
};

export class BitcoinRunesNetwork extends Network<BitcoinRunesNetworkConfig> {
  public label = NETWORKS['bitcoin-runes'].label;

  public logo = BitcoinRunesIcon;

  public name = NETWORKS['bitcoin-runes'].key;

  public generateLockTx: BitcoinRunesNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };

  public submitTransaction: BitcoinRunesNetworkConfig['submitTransaction'] = (...args) => {
    return this.config.submitTransaction(...args);
  };
}
