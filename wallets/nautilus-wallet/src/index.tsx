import { ErgoWallet } from '@rosen-ui/wallet-api';
import { NautilusIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';
import { getBalance } from './getBalance';

const Nautilus: ErgoWallet = {
  icon: NautilusIcon,
  name: 'Nautilus Wallet',
  connectWallet,
  getBalance,
};

export default Nautilus;
