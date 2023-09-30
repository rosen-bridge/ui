import { useEffect, useContext, useCallback, useRef } from 'react';
import { Wallet } from '@rosen-ui/wallet-api';
import { useLocalStorageManager } from '@rosen-ui/utils';

import useNetwork from './useNetwork';

import { WalletContext } from '@/_contexts/walletContext';

interface WalletDescriptor {
  readonly name: string;
  readonly expDate: string;
}

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

const useWallet = () => {
  const walletGlobalContext = useContext(WalletContext);
  const isConnecting = useRef<boolean>(false);
  const { get, set } = useLocalStorageManager();

  const { selectedNetwork } = useNetwork();

  const toWalletContract = useCallback(
    (name: string): Wallet => {
      let wallet: Wallet | undefined;
      wallet = selectedNetwork?.availableWallets.find((w) => w.name === name);

      if (!wallet) {
        throw new Error(`unsupported wallet with name ${name}`);
      }

      return wallet;
    },
    [selectedNetwork],
  );

  const getCurrentWallet = useCallback((): Wallet | undefined => {
    const currentWalletDescriptor =
      selectedNetwork && get<WalletDescriptor>(selectedNetwork?.name);

    if (!currentWalletDescriptor) {
      return undefined;
    }

    return currentWalletDescriptor
      ? toWalletContract(currentWalletDescriptor.name)
      : undefined;
  }, [selectedNetwork, toWalletContract, get]);

  const setSelectedWallet = useCallback(
    async (wallet: Wallet) => {
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
        availableWallets: selectedNetwork.availableWallets,
        getBalance: walletGlobalContext?.state.selectedWallet?.getBalance,
      }
    : {};
};

export default useWallet;
