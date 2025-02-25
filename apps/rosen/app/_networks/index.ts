import { NETWORKS } from '@rosen-ui/constants';

import { binanceNetwork } from './binance';
import { bitcoinNetwork } from './bitcoin';
import { cardanoNetwork } from './cardano';
import { ergoNetwork } from './ergo';
import { ethereumNetwork } from './ethereum';

export const availableNetworks = {
  [NETWORKS.binance.key]: binanceNetwork,
  [NETWORKS.bitcoin.key]: bitcoinNetwork,
  [NETWORKS.cardano.key]: cardanoNetwork,
  [NETWORKS.ergo.key]: ergoNetwork,
  [NETWORKS.ethereum.key]: ethereumNetwork,
} as const;

export type AvailableNetworks =
  (typeof availableNetworks)[keyof typeof availableNetworks];
