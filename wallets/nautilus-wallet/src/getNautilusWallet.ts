import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { nautilusWalletInfo } from './nautilusWalletInfo';

/**
 * nautilus implementation of the Wallet
 * interface to be able to interact with nautilus wallet
 */

export const getNautilusWallet = () => {
  return createRawWallet(
    {
      ...nautilusWalletInfo,
      connectWallet,
    },
    ergoConnector.nautilus as any // TODO
  );
};
