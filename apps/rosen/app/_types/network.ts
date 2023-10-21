import { ValueOf } from '@rosen-ui/types';
import { Wallet } from '@rosen-ui/wallet-api';

import { CardanoWallet, ErgoWallet } from '@rosen-ui/wallet-api';

import { Networks } from '@/_constants';

/**
 * the main network interface for all supported networks
 */
export interface Network<T> {
  name: ValueOf<typeof Networks>;
  logo: string;
  label: string;
  availableWallets: T[];
  nextHeightInterval: number;
  api: {
    explorerUrl: string;
    networkStatusUrl: string;
  };
}
export type SupportedWallets = CardanoWallet | ErgoWallet;
