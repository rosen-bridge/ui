import { Wallet, WalletInfo } from '@rosen-ui/wallet-api';

import { Networks } from '@/_constants';

type NetworksType = typeof Networks;

/**
 * the main network interface for all supported networks
 */
export interface Network<T> {
  name: NetworksType[keyof NetworksType];
  logo: string;
  label: string;
  availableWallets: T[];
  supportedWallets: WalletInfo[];
  nextHeightInterval: number;
  api: {
    explorerUrl: string;
    networkStatusUrl: string;
  };
  lockAddress: string;
}
export type SupportedWallets = Wallet;
