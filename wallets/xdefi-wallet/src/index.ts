import { XdefiIcon } from '@rosen-bridge/icons';
import { WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';
import { getAddress, signTransaction } from 'sats-connect';

import { connectWallet } from './connectWallet';

export const walletInfo: WalletInfo = {
  icon: XdefiIcon,
  name: 'Xdefi',
  label: 'Xdefi',
  link: 'https://www.xdefi.io/',
};

/**
 * Xdefi implementation of the Wallet
 * interface to be able to interact with Xdefi wallet
 */
const getXdefiWallet = () =>
  createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    {
      getAddress,
      signTransaction,
    }
  );

export const isXdefiAvailable = () =>
  typeof xfi !== 'undefined' && !!xfi?.bitcoin;

export { BitcoinNetworkType, AddressPurpose } from 'sats-connect';

export default getXdefiWallet;
