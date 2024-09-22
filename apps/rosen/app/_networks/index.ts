import BitcoinNetwork from './bitcoin';
import CardanoNetwork from './cardano';
import ErgoNetwork from './ergo';
import EthereumNetwork from './ethereum';

import { NETWORKS } from '@rosen-ui/constants';

export const availableNetworks = {
  [NETWORKS.ERGO]: ErgoNetwork,
  [NETWORKS.ETHEREUM]: EthereumNetwork,
  [NETWORKS.CARDANO]: CardanoNetwork,
  [NETWORKS.BITCOIN]: BitcoinNetwork,
} as const;
