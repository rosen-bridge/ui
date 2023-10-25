import { NamiIcon } from '@rosen-bridge/icons';

import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */
const Nami = createRawWallet(
  {
    icon: NamiIcon,
    name: 'nami',
    label: 'Nami',
    connectWallet,
  },
  cardano.nami
);

export default Nami;
