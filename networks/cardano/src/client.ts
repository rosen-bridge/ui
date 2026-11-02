import { Cardano as CardanoIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './generateLockTx';
import type { decodeWasmValue, setTxWitnessSet } from './utils';

type CardanoNetworkConfig = NetworkConfig & {
  decodeWasmValue: typeof decodeWasmValue;
  generateLockTx: ReturnType<typeof generateLockTx>;
  setTxWitnessSet: typeof setTxWitnessSet;
};

export class CardanoNetwork extends Network<CardanoNetworkConfig> {
  public label = NETWORKS.cardano.label;

  public logo = CardanoIcon;

  public name = NETWORKS.cardano.key;

  public decodeWasmValue: CardanoNetworkConfig['decodeWasmValue'] = (...args) => {
    return this.config.decodeWasmValue(...args);
  };

  public generateLockTx: CardanoNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };

  public setTxWitnessSet: CardanoNetworkConfig['setTxWitnessSet'] = (...args) => {
    return this.config.setTxWitnessSet(...args);
  };
}
