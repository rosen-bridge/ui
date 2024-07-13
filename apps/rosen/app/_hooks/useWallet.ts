import { useEffect, useContext, useCallback, useRef } from 'react';
import { WalletBase } from '@rosen-ui/wallet-api';
import { useLocalStorageManager } from '@rosen-ui/common-hooks';

import useNetwork from './useNetwork';

import { WalletContext } from '@/_contexts/walletContext';

import { SupportedWallets } from '@/_types/network';

interface WalletDescriptor {
  readonly name: string;
  readonly expDate: string;
}

/**
 * generates and return the wallet object to save in the local storage
 */
const toWalletDescriptor = (wallet: WalletBase): WalletDescriptor => {
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
const useWallet = () => {
  const walletGlobalContext = useContext(WalletContext);
  const isConnecting = useRef<boolean>(false);
  const { get, set } = useLocalStorageManager();

  const { selectedNetwork } = useNetwork();

  /**
   * searches in the available wallets in the selected network
   * and return the wallet object if it finds a match
   */
  const getWallet = useCallback(
    (name: string): SupportedWallets => {
      let wallet: SupportedWallets | undefined;

      wallet = (
        selectedNetwork
          ? selectedNetwork.wallets.filter((wallet) => wallet.isAvailable())
          : []
      ).find((w: SupportedWallets) => w.name === name);
      if (!wallet) {
        throw new Error(`unsupported wallet with name ${name}`);
      }

      return wallet;
    },
    [selectedNetwork],
  );

  /**
   * searches in local storage for already selected wallets and
   * returns the wallet object if it finds match
   */
  const getCurrentWallet = useCallback((): SupportedWallets | undefined => {
    const currentWalletDescriptor =
      selectedNetwork && get<WalletDescriptor>(selectedNetwork?.name);

    if (!currentWalletDescriptor) {
      return undefined;
    }

    return currentWalletDescriptor
      ? getWallet(currentWalletDescriptor.name)
      : undefined;
  }, [selectedNetwork, getWallet, get]);

  /**
   * disconnects the previously selected wallet and
   * calls the connection callbacks
   */
  const setSelectedWallet = useCallback(
    async (wallet: SupportedWallets) => {
      const prevWallet = getCurrentWallet();
      const status = await wallet.connectWallet();

      if (typeof status === 'boolean' && status) {
        prevWallet?.onDisconnect && prevWallet.onDisconnect();
        wallet.onConnect && wallet.onConnect();
        set<WalletDescriptor>(
          selectedNetwork!.name,
          toWalletDescriptor(wallet),
        );
        walletGlobalContext?.dispatch({ type: 'set', wallet });
      }
    },
    [selectedNetwork, getCurrentWallet, walletGlobalContext, set],
  );

  const handleConnection = useCallback(async () => {
    const selectedWallet = getCurrentWallet();
    if (
      selectedWallet?.name !== walletGlobalContext?.state.selectedWallet?.name
    ) {
      if (selectedWallet) {
        const status = await selectedWallet.connectWallet();
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

  return selectedNetwork
    ? {
        setSelectedWallet,
        selectedWallet: walletGlobalContext?.state.selectedWallet,
        wallets: selectedNetwork.wallets,
        getBalance: walletGlobalContext?.state.selectedWallet?.getBalance,
      }
    : {};
};

export default useWallet;
