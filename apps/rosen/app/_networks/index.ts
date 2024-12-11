import { NETWORKS } from '@rosen-ui/constants';

import { BinanceNetwork } from './binance';
import { BitcoinNetwork } from './bitcoin';
import { CardanoNetwork } from './cardano';
import { ErgoNetwork } from './ergo';
import { EthereumNetwork } from './ethereum';

export const availableNetworks = {
  [NETWORKS.BINANCE]: BinanceNetwork,
  [NETWORKS.ERGO]: ErgoNetwork,
  [NETWORKS.ETHEREUM]: EthereumNetwork,
  [NETWORKS.CARDANO]: CardanoNetwork,
  [NETWORKS.BITCOIN]: BitcoinNetwork,
} as const;

export type AvailableNetworks =
  (typeof availableNetworks)[keyof typeof availableNetworks];
