import { NamiIcon } from '@rosen-bridge/icons';

import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: NamiIcon,
  name: 'Nami',
  label: 'Nami',
  link: 'https://namiwallet.io/',
};

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const getNamiWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    cardano.nami
  );

export const isNamiAvailable = () =>
  typeof cardano !== 'undefined' && cardano?.nami;

export default getNamiWallet;
