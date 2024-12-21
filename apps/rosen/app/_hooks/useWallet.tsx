import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useSnackbar } from '@rosen-bridge/ui-kit';
import { Wallet } from '@rosen-ui/wallet-api';

import { useNetwork } from './useNetwork';

/**
 * handles the wallet connections for all the networks
 * and reconnect to the wallet on app startup
 */
export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
};

export type WalletContextType = {
  setSelectedWallet: (wallet: Wallet) => Promise<void>;
  selectedWallet?: Wallet;
  wallets: Wallet[];
};

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { selectedSource } = useNetwork();

  const { openSnackbar } = useSnackbar();

  const [selected, setSelected] = useState<Wallet>();

  const select = useCallback(
    async (wallet: Wallet) => {
      const isConnected = await wallet.connect();

      if (!isConnected) return;

      try {
        await wallet.switchChain?.(selectedSource.name);
      } catch (error: any) {
        return openSnackbar(error.message, 'error');
      }

      setSelected(wallet);

      if (!selectedSource) return;

      localStorage.setItem('rosen:wallet:' + selectedSource.name, wallet.name);
    },
    [selectedSource, openSnackbar, setSelected],
  );

  useEffect(() => {
    setSelected(undefined);

    if (!selectedSource) return;

    const name = localStorage.getItem('rosen:wallet:' + selectedSource.name);

    const selected = selectedSource.wallets.find(
      (wallet) => wallet.name === name && wallet.isAvailable(),
    );

    if (!selected) return;

    if (!selected.switchChain) return setSelected(selected);

    selected
      .switchChain(selectedSource.name, true)
      .then(() => setSelected(selected))
      .catch(() => setSelected(undefined));
  }, [selectedSource, setSelected]);

  const state = {
    setSelectedWallet: select,
    selectedWallet: selected,
    wallets: selectedSource?.wallets || [],
  };

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
};
