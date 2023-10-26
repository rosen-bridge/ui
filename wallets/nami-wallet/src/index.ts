import { NamiIcon } from '@rosen-bridge/icons';

import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const getNamiWallet = () =>
  createRawWallet(
    {
      icon: NamiIcon,
      name: 'Nami',
      label: 'Nami',
      connectWallet,
    },
    cardano.nami
  );

export const isNamiAvailable = () =>
  typeof cardano !== 'undefined' && cardano?.nami;

export default getNamiWallet;
