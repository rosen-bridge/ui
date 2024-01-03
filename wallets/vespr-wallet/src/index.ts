import { VesprIcon } from '@rosen-bridge/icons';

import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: VesprIcon,
  name: 'Vespr',
  label: 'Vespr',
  link: 'https://vespr.xyz/',
};

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const getVesprWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    cardano.vespr
  );

export const isVesprAvailable = () =>
  typeof cardano !== 'undefined' && cardano?.vespr;

export default getVesprWallet;
