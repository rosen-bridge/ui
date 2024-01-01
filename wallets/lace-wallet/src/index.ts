import { LaceIcon } from '@rosen-bridge/icons';

import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: LaceIcon,
  name: 'Lace',
  label: 'Lace',
  link: 'https://www.lace.io/',
};

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const getLaceWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    cardano.lace
  );

export const isLaceAvailable = () =>
  typeof cardano !== 'undefined' && cardano?.lace;

export default getLaceWallet;
