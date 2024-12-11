import { useEffect, useContext, useCallback, useRef } from 'react';

import { useLocalStorageManager } from '@rosen-ui/common-hooks';
import { Wallet } from '@rosen-ui/wallet-api';

import { WalletContext } from '@/_contexts/walletContext';

import { useNetwork } from './useNetwork';

interface WalletDescriptor {
  readonly name: string;
  readonly expDate: string;
}

/**
 * generates and return the wallet object to save in the local storage
 */
const toWalletDescriptor = (wallet: Wallet): WalletDescriptor => {
  let expDate = new Date();
  return {
    name: wallet.name,
    expDate: expDate.setDate(expDate.getDate() + 2).toString(),
  };
};

/**
 * handles the wallet connections for all the networks
 * and reconnect to the wallet on app startup
 */
export const useWallet = () => {
  const walletGlobalContext = useContext(WalletContext);
  const isConnecting = useRef<boolean>(false);
  const { get, set } = useLocalStorageManager();

  const { selectedSource } = useNetwork();

  /**
   * searches in the available wallets in the selected network
   * and return the wallet object if it finds a match
   */
  const getWallet = useCallback(
    (name: string): Wallet => {
      let wallet: Wallet | undefined;

      wallet = (
        selectedSource
          ? selectedSource.wallets.filter((wallet) => wallet.isAvailable())
          : []
      ).find((w: Wallet) => w.name === name);
      if (!wallet) {
        throw new Error(`unsupported wallet with name ${name}`);
      }

      return wallet;
    },
    [selectedSource],
  );

  /**
   * searches in local storage for already selected wallets and
   * returns the wallet object if it finds match
   */
  const getCurrentWallet = useCallback((): Wallet | undefined => {
    const currentWalletDescriptor =
      selectedSource && get<WalletDescriptor>(selectedSource?.name);

    if (!currentWalletDescriptor) {
      return undefined;
    }

    return currentWalletDescriptor
      ? getWallet(currentWalletDescriptor.name)
      : undefined;
  }, [selectedSource, getWallet, get]);

  /**
   * disconnects the previously selected wallet and
   * calls the connection callbacks
   */
  const setSelectedWallet = useCallback(
    async (wallet: Wallet) => {
      const prevWallet = getCurrentWallet();
      const status = await wallet.connect();

      if (typeof status === 'boolean' && status) {
        set<WalletDescriptor>(selectedSource!.name, toWalletDescriptor(wallet));
        walletGlobalContext?.dispatch({ type: 'set', wallet });
      }
    },
    [selectedSource, getCurrentWallet, walletGlobalContext, set],
  );

  const handleConnection = useCallback(async () => {
    const selectedWallet = getCurrentWallet();
    if (
      selectedWallet?.name !== walletGlobalContext?.state.selectedWallet?.name
    ) {
      if (selectedWallet) {
        const status = await selectedWallet.connect();
        if (typeof status === 'boolean' && status) {
          walletGlobalContext?.dispatch({
            type: 'set',
            wallet: selectedWallet,
          });
        }
        isConnecting.current = false;
      } else {
        walletGlobalContext?.dispatch({ type: 'remove' });
      }
    }
  }, [walletGlobalContext, getCurrentWallet]);

  useEffect(() => {
    if (typeof window === 'object') {
      handleConnection();
    }
  }, [handleConnection]);

  return selectedSource
    ? {
        setSelectedWallet,
        selectedWallet: walletGlobalContext?.state.selectedWallet,
        wallets: selectedSource.wallets,
        getBalance: walletGlobalContext?.state.selectedWallet?.getBalance,
      }
    : {};
};
