import { NETWORKS } from '@rosen-ui/constants';

import { binanceNetwork } from './binance';
import { bitcoinNetwork } from './bitcoin';
import { cardanoNetwork } from './cardano';
import { ergoNetwork } from './ergo';
import { ethereumNetwork } from './ethereum';

export const availableNetworks = {
  [NETWORKS.BINANCE]: binanceNetwork,
  [NETWORKS.BITCOIN]: bitcoinNetwork,
  [NETWORKS.CARDANO]: cardanoNetwork,
  [NETWORKS.ERGO]: ergoNetwork,
  [NETWORKS.ETHEREUM]: ethereumNetwork,
} as const;

export type AvailableNetworks =
  (typeof availableNetworks)[keyof typeof availableNetworks];
