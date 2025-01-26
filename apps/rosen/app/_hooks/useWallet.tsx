import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSnackbar } from '@rosen-bridge/ui-kit';
import { Wallet } from '@rosen-ui/wallet-api';

import * as availableWallets from '@/_wallets';

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

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { selectedSource } = useNetwork();

  const { openSnackbar } = useSnackbar();

  const [selected, setSelected] = useState<Wallet>();

  const wallets = useMemo(() => {
    if (!selectedSource) return [];
    return Object.values<Wallet>(availableWallets).filter((wallet) => {
      return wallet.supportedChains.includes(selectedSource.name);
    });
  }, [selectedSource]);

  const select = useCallback(
    async (wallet: Wallet) => {
      try {
        await wallet.connect();
        if (wallet.switchChain && selectedSource) {
          await wallet.switchChain(selectedSource.name);
        }
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
    (async () => {
      setSelected(undefined);

      if (!selectedSource) return;

      const name = localStorage.getItem('rosen:wallet:' + selectedSource.name);

      const wallet = availableWallets[name as keyof typeof availableWallets];

      if (!wallet) return;

      if (!wallet.isAvailable()) return;

      if (Object.hasOwn(wallet, 'isConnected') && !(await wallet.isConnected())) return;

      try {
        await wallet.connect();

        if ('switchChain' in wallet) {
          await wallet.switchChain(selectedSource.name, true);
        }

        setSelected(wallet);
      } catch (error) {
        setSelected(undefined);
        throw error;
      }
    })();
  }, [selectedSource, setSelected]);

  const state = {
    select,
    selected,
    wallets,
  };

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
};
