import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';
import { NautilusIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: NautilusIcon,
  name: 'Nautilus',
  label: 'Nautilus',
  link: 'https://github.com/nautls/nautilus-wallet',
};

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */

const getNautilusWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    ergoConnector.nautilus
  );

export const isNautilusAvailable = () =>
  typeof ergoConnector !== 'undefined' && !!ergoConnector.nautilus;

export default getNautilusWallet;
