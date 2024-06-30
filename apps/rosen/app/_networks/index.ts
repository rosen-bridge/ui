import BitcoinNetwork from './bitcoin';
import CardanoNetwork from './cardano';
import ErgoNetwork from './ergo';

import { Networks } from '@rosen-ui/constants';

export const availableNetworks = {
  [Networks.ERGO]: ErgoNetwork,
  [Networks.CARDANO]: CardanoNetwork,
  [Networks.BITCOIN]: BitcoinNetwork,
} as const;

export type AvailableNetworks = Exclude<
  (typeof Networks)[keyof typeof Networks],
  'ethereum'
>;
