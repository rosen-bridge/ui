import { useEffect, useContext, useCallback, useRef } from 'react';

import { useSnackbar } from '@rosen-bridge/ui-kit';
import { useLocalStorageManager } from '@rosen-ui/common-hooks';
import { Wallet } from '@rosen-ui/wallet-api';

import { WalletContext } from '@/_contexts/walletContext';

import { useNetwork } from './useNetwork';

interface WalletDescriptor {
  readonly name: string;
  readonly expDate: string;
}

let lastTry: number;
let errorOnSwitching: string;

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
  const { openSnackbar } = useSnackbar();

  /**
   * searches in the available wallets in the selected network
   * and return the wallet object if it finds a match
   */
  const getWallet = useCallback(
    (name: string) => {
      return selectedSource?.wallets
        .filter((wallet) => wallet.isAvailable())
        .find((wallet) => wallet.name === name);
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
        errorOnSwitching = '';
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

  useEffect(() => {
    const run = async () => {
      if (!selectedSource) return;

      if (!walletGlobalContext?.state?.selectedWallet?.switchChain) return;

      if (lastTry > Date.now()) return;

      const key =
        selectedSource.name + walletGlobalContext.state.selectedWallet.name;

      if (errorOnSwitching === key) return;

      lastTry = Date.now() + 500;

      try {
        await walletGlobalContext.state.selectedWallet.switchChain(
          selectedSource.name,
        );
        errorOnSwitching = '';
        /**
         * TODO: replace the any type
         * local:ergo/rosen-bridge/ui#471
         */
        // eslint-disable-next-line
      } catch (error: any) {
        errorOnSwitching = key;
        walletGlobalContext.dispatch({ type: 'remove' });
        openSnackbar(error.message, 'error');
      }
    };

    run();
  }, [selectedSource, walletGlobalContext, openSnackbar]);

  return selectedSource
    ? {
        setSelectedWallet,
        selectedWallet: errorOnSwitching
          ? null
          : walletGlobalContext?.state.selectedWallet,
        wallets: selectedSource.wallets,
        getBalance: walletGlobalContext?.state.selectedWallet?.getBalance,
      }
    : {};
};
