import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useToast } from '@rosen-bridge/ui-kit';
import type { Wallet } from '@rosen-ui/wallet-api';

import * as wallets from '@/wallets';

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

type WalletState =
  | 'IDLE'
  | 'DISCONNECTING'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED';

export type WalletContextType = {
  select: (wallet: Wallet) => Promise<void>;
  selected?: Wallet;
  state: WalletState;
  wallets: Wallet[];
  disconnect: () => void;
};

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { selectedSource } = useNetwork();

  const toast = useToast();

  const [selected, setSelected] = useState<Wallet>();

  const [state, setState] = useState<WalletState>('DISCONNECTED');

  const filtered = useMemo(() => {
    if (!selectedSource) return [];
    return Object.values<Wallet>(wallets).filter((wallet) => {
      return wallet.supportedChains.includes(selectedSource.name);
    });
  }, [selectedSource]);

  const select = useCallback(
    async (wallet: Wallet) => {
      if (!selectedSource) return;

      try {
        setState('CONNECTING');

        await wallet.initialize();

        await wallet.connect();

        await wallet.switchChain(selectedSource.name);

        await wallet.getAddress();
        // biome-ignore lint/suspicious/noExplicitAny: Use a better type
      } catch (error: any) {
        setState('DISCONNECTED');
        toast.add({
          type: 'error',
          description: error.message,
        });
        return;
      }

      setSelected(wallet);
      setState('CONNECTED');

      localStorage.setItem(`rosen:wallet:${selectedSource.name}`, wallet.name);
    },
    [selectedSource, toast.add],
  );

  const disconnect = useCallback(async () => {
    if (!selected) return;

    if (!selectedSource) return;

    setState('DISCONNECTING');

    try {
      await selected.disconnect();
    } catch {
      //
    }

    localStorage.removeItem(`rosen:wallet:${selectedSource.name}`);

    setSelected(undefined);
    setState('DISCONNECTED');
  }, [selected, selectedSource]);

  useEffect(() => {
    (async () => {
      setSelected(undefined);
      setState('IDLE');

      if (!selectedSource) return;

      setState('DISCONNECTED');

      const name = localStorage.getItem(`rosen:wallet:${selectedSource.name}`);

      if (!name) return;

      const wallet = Object.values(wallets).find(
        (wallet) => wallet.name === name,
      );

      if (!wallet) return;

      try {
        setState('CONNECTING');

        await wallet.initialize();

        if (!wallet.isAvailable()) {
          return void setState('DISCONNECTED');
        }

        if (!(await wallet.isConnected())) {
          return void setState('DISCONNECTED');
        }

        await wallet.connect();

        await wallet.switchChain?.(selectedSource.name, true);

        await wallet.getAddress();

        setSelected(wallet);
        setState('CONNECTED');
      } catch (error) {
        setSelected(undefined);
        setState('DISCONNECTED');
        console.log(error);
      }
    })();
  }, [selectedSource]);

  const value = useMemo(
    () => ({
      select,
      selected,
      state,
      wallets: filtered,
      disconnect,
    }),
    [select, selected, state, filtered, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
