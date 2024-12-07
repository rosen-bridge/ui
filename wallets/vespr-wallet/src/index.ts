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
 * Vespr implementation of the Wallet
 * interface to be able to interact with Vespr wallet
 */
const getVesprWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    () => window.cardano.vespr,
  );

export const isVesprAvailable = () =>
  typeof window.cardano !== 'undefined' && window.cardano?.vespr;

export default getVesprWallet;
