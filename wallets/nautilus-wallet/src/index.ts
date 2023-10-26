import { createRawWallet } from '@rosen-ui/wallet-api';
import { NautilusIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */

const getNautilusWallet = () =>
  createRawWallet(
    {
      icon: NautilusIcon,
      name: 'Nautilus',
      label: 'Nautilus',
      connectWallet,
    },
    ergoConnector.nautilus
  );

export const isNautilusAvailable = () =>
  typeof ergoConnector !== 'undefined' && !!ergoConnector.nautilus;

export default getNautilusWallet;
