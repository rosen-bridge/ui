import { CardanoWallet } from '@rosen-ui/wallet-api';
import { NamiIcon } from '@rosen-bridge/icons';

import { connectWallet } from './connectWallet';
import { getBalance } from './getBalance';

/**
 * nautilus implementation of the ErgoWallet
 * interface to be able to interact with nautilus wallet
 */
const NamiWallet: CardanoWallet = {
  icon: NamiIcon,
  name: 'Nami',
  connectWallet,
  getBalance,
};

export default NamiWallet;
