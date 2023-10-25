import { createRawWallet } from '@rosen-ui/wallet-api';
import { NautilusIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */

const Nautilus = createRawWallet(
  {
    icon: NautilusIcon,
    name: 'nautilus',
    label: 'Nautilus',
    connectWallet,
  },
  ergoConnector.nautilus
);

export default Nautilus;
