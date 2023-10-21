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
  name: 'nautilus',
  label: 'Nautilus',
  connectWallet,
  getBalance,
  createTransaction: (...args) => {
    console.log('Ergo Create Transaction. args: ', args);
  },
};

export default Nautilus;
