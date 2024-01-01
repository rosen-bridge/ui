import { FlintIcon } from '@rosen-bridge/icons';

import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: FlintIcon,
  name: 'Flint',
  label: 'Flint',
  link: 'https://flint-wallet.com/',
};

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const getFlintWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    cardano.flint
  );

export const isFlintAvailable = () =>
  typeof cardano !== 'undefined' && cardano?.flint;

export default getFlintWallet;
