import { CardanoWallet } from '@rosen-ui/wallet-api';
import { NamiIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';
import { getBalance } from './getBalance';

const NamiWallet: CardanoWallet = {
  icon: NamiIcon,
  name: 'Nami Wallet',
  connectWallet,
  getBalance,
};

export default NamiWallet;
