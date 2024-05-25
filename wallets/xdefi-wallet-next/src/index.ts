import { XdefiIcon } from '@rosen-bridge/icons';
import { Wallet, WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';
import { getAddress, signTransaction } from 'sats-connect';

import { connectWallet } from './connectWallet';
import type { getBalance, transfer } from './server';

type XdefiWalletCreator = {
  getBalance: typeof getBalance;
  transfer: typeof transfer;
};

export const walletInfo: WalletInfo = {
  icon: XdefiIcon,
  name: 'Xdefi',
  label: 'Xdefi',
  link: 'https://www.xdefi.io/',
};

export const isXdefiAvailable = () =>
  typeof xfi !== 'undefined' && !!xfi?.bitcoin;

/**
 * Xdefi implementation of the Wallet
 * interface to be able to interact with Xdefi wallet
 */
export const getXdefiWallet = () => {
  return createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    {
      getAddress,
      signTransaction,
    }
  );
};

export const xdefiWalletCreator = ({
  getBalance,
  transfer,
}: XdefiWalletCreator): Wallet => {
  return {
    ...getXdefiWallet(),
    getBalance,
    transfer,
  };
};
