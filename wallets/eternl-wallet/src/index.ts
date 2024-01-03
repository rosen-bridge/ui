import { EternlIcon } from '@rosen-bridge/icons';

import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: EternlIcon,
  name: 'Eternl',
  label: 'Eternl',
  link: 'https://eternl.io/',
};

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const getEternlWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    cardano.eternl
  );

export const isEternlAvailable = () =>
  typeof cardano !== 'undefined' && cardano?.eternl;

export default getEternlWallet;
