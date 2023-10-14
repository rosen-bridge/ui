import { ErgoWallet } from '@rosen-ui/wallet-api';
import { NautilusIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';
import { getBalance } from './getBalance';

/**
 * nautilus implementation of the ErgoWallet
 * interface to be able to interact with nautilus wallet
 */

const Nautilus: ErgoWallet = {
  icon: NautilusIcon,
  name: 'Nautilus',
  connectWallet,
  getBalance,
};

export default Nautilus;
