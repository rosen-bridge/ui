import type { Wallet } from '@rosen-ui/wallet-api';

import { withBitcoinCash } from '../networks/bitcoin-cash/registration';
import './base';
import { cashonize } from './cashonize';
import { eternl } from './eternl';
import { firoWallet } from './firo';
import { lace } from './lace';
import { metaMask } from './metaMask';
import { myDoge } from './myDoge';
import { nautilus } from './nautilus';
import { okx } from './okx';
import { shakeWallet } from './shake';
import { walletConnect } from './walletConnect';
import { xverse } from './xverse';

export * from './eternl';
export * from './firo';
export * from './lace';
export * from './metaMask';
export * from './myDoge';
export * from './nautilus';
export * from './okx';
export * from './shake';
export * from './walletConnect';
export * from './xverse';

/** Preserve existing wallet instances and offer Cashonize only with its assigned configured network. */
const wallets: Readonly<Record<string, Wallet>> = withBitcoinCash<Wallet>(
  { eternl, firoWallet, lace, metaMask, myDoge, nautilus, okx, shakeWallet, walletConnect, xverse },
  cashonize,
);

export default wallets;
