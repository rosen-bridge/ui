import BitcoinNetwork from './bitcoin';
import CardanoNetwork from './cardano';
import ErgoNetwork from './ergo';

import { Networks } from '@/_constants';

export const availableNetworks = {
  [Networks.ergo]: ErgoNetwork,
  [Networks.cardano]: CardanoNetwork,
  [Networks.bitcoin]: BitcoinNetwork,
};

export type AvailableNetworks = keyof typeof Networks;
