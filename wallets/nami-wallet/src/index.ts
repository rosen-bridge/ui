import { NamiIcon } from '@rosen-bridge/icons';

import { createCardanoWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';

/**
 * nautilus implementation of the ErgoWallet
 * interface to be able to interact with nautilus wallet
 */
const namiWallet = createCardanoWallet({
  icon: NamiIcon,
  name: 'nami',
  label: 'Nami',
  connectWallet,
});

export default namiWallet;
