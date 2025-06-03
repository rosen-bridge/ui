import { Cardano as CardanoIcon } from '@rosen-bridge/icons';
import { Network, NetworkConfig } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateUnsignedTx } from './generateUnsignedTx';
import type {
  decodeWasmValue,
  generateLockAuxiliaryData,
  setTxWitnessSet,
} from './utils';

type CardanoNetworkConfig = NetworkConfig & {
  decodeWasmValue: typeof decodeWasmValue;
  generateLockAuxiliaryData: typeof generateLockAuxiliaryData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  setTxWitnessSet: typeof setTxWitnessSet;
};

export class CardanoNetwork implements Network {
  public label = NETWORKS.cardano.label;

  public lockAddress: string;

  public logo = CardanoIcon;

  public name = NETWORKS.cardano.key;

  public nextHeightInterval: number;

  constructor(protected config: CardanoNetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public decodeWasmValue: CardanoNetworkConfig['decodeWasmValue'] = (
    ...args
  ) => {
    return this.config.decodeWasmValue(...args);
  };

  public generateLockAuxiliaryData: CardanoNetworkConfig['generateLockAuxiliaryData'] =
    (...args) => {
      return this.config.generateLockAuxiliaryData(...args);
    };

  public generateUnsignedTx: CardanoNetworkConfig['generateUnsignedTx'] = (
    ...args
  ) => {
    return this.config.generateUnsignedTx(...args);
  };

  public getMaxTransfer: CardanoNetworkConfig['getMaxTransfer'] = (...args) => {
    return this.config.getMaxTransfer(...args);
  };

  public setTxWitnessSet: CardanoNetworkConfig['setTxWitnessSet'] = (
    ...args
  ) => {
    return this.config.setTxWitnessSet(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };
}
