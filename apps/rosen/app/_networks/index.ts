import BitcoinNetwork from './bitcoin';
import CardanoNetwork from './cardano';
import ErgoNetwork from './ergo';
import EthereumNetwork from './ethereum';

import { Networks } from '@rosen-ui/constants';

export const availableNetworks = {
  [Networks.ERGO]: ErgoNetwork,
  [Networks.ETHEREUM]: EthereumNetwork,
  [Networks.CARDANO]: CardanoNetwork,
  [Networks.BITCOIN]: BitcoinNetwork,
} as const;

export type AvailableNetworks = (typeof Networks)[keyof typeof Networks];
