import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  select: (wallet: Wallet) => Promise<void>;
  selected?: Wallet;
  wallets: Wallet[];
};

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { selectedSource } = useNetwork();

  const [selected, setSelected] = useState<Wallet>();

  const select = useCallback(
    async (wallet: Wallet) => {
      if (wallet.name === selected?.name) return;

      const connected = await wallet.connect();

      if (!connected) return;

      setSelected(wallet);

      if (!selectedSource) return;

      localStorage.setItem('rosen:wallet:' + selectedSource.name, wallet.name);
    },
    [selected, selectedSource, setSelected],
  );

  useEffect(() => {
    if (!selectedSource) return;

    const name = localStorage.getItem('rosen:wallet:' + selectedSource.name);

    const selected = selectedSource.wallets.find(
      (wallet) => wallet.name === name && wallet.isAvailable(),
    );

    if (!selected) return;

    select(selected);
  }, [select, selectedSource]);

  const state = {
    select,
    selected,
    wallets: selectedSource?.wallets || [],
  };

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
};
