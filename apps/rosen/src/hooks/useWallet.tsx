import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useToast } from '@rosen-bridge/ui-kit';
import type { Wallet } from '@rosen-ui/wallet-api';

import wallets from '@/wallets';

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

type WalletState = 'IDLE' | 'DISCONNECTING' | 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

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

  const generation = useRef(0);
  const source = useRef(selectedSource?.name);
  source.current = selectedSource?.name;
  const pending = useRef<Wallet | undefined>(undefined);

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
      if (!selectedSource || !wallet.supportedChains.includes(selectedSource.name)) return;

      const lease = ++generation.current;
      const chain = selectedSource.name;
      /** Keep asynchronous wallet results owned by their original source and selection. */
      const active = () => generation.current === lease && source.current === chain;
      const previous = pending.current;
      pending.current = wallet;

      try {
        if (previous?.supportedChains.includes('bitcoin-cash')) await previous.disconnect();
        if (!active()) return;
        setState('CONNECTING');

        await wallet.initialize();
        if (!active()) return;

        await wallet.connect();
        if (!active()) return;

        await wallet.switchChain(chain);
        if (!active()) return;

        await wallet.getAddress();
        if (!active()) return;
        /**
         * TODO: remove the inline Biome comment
         * local:ergo/rosen-bridge/ui#441
         */
        // biome-ignore lint/suspicious/noExplicitAny: Use a better type
      } catch (error: any) {
        if (!active()) return;
        setState('DISCONNECTED');
        toast.add({
          type: 'error',
          description: error.message,
        });
        return;
      } finally {
        if (active() && pending.current === wallet) pending.current = undefined;
      }

      setSelected(wallet);
      setState('CONNECTED');

      localStorage.setItem(`rosen:wallet:${chain}`, wallet.name);
    },
    [selectedSource, toast.add],
  );

  const disconnect = useCallback(async () => {
    const lease = ++generation.current;
    const connecting = pending.current;
    pending.current = undefined;
    if (connecting?.supportedChains.includes('bitcoin-cash')) {
      try {
        await connecting.disconnect();
      } catch {
        // Local selection authority is already invalidated.
      }
    }
    if (generation.current !== lease) return;
    setState('DISCONNECTED');
    if (!selected) return;

    if (!selectedSource) return;

    setState('DISCONNECTING');

    try {
      await selected.disconnect();
    } catch {
      //
    }

    if (generation.current !== lease) return;

    localStorage.removeItem(`rosen:wallet:${selectedSource.name}`);

    setSelected(undefined);
    setState('DISCONNECTED');
  }, [selected, selectedSource]);

  useEffect(() => {
    const lease = ++generation.current;
    const chain = selectedSource?.name;
    /** Ignore startup restoration after a source change, replacement or unmount. */
    const active = () => generation.current === lease && source.current === chain;
    (async () => {
      setSelected(undefined);
      setState('IDLE');

      if (!selectedSource) return;

      setState('DISCONNECTED');

      const name = localStorage.getItem(`rosen:wallet:${selectedSource.name}`);

      if (!name) return;

      const wallet = Object.values(wallets).find((wallet) => wallet.name === name);

      if (!wallet) return;

      try {
        setState('CONNECTING');

        await wallet.initialize();
        if (!active()) return;

        if (!wallet.isAvailable()) {
          return void setState('DISCONNECTED');
        }

        const connected = await wallet.isConnected();
        if (!active()) return;
        if (!connected) {
          return void setState('DISCONNECTED');
        }

        pending.current = wallet;
        await wallet.connect();
        if (!active()) return;

        await wallet.switchChain?.(selectedSource.name, true);
        if (!active()) return;

        await wallet.getAddress();
        if (!active()) return;

        setSelected(wallet);
        setState('CONNECTED');
      } catch (error) {
        if (!active()) return;
        setSelected(undefined);
        setState('DISCONNECTED');
        console.log(error);
      } finally {
        if (active()) pending.current = undefined;
      }
    })();
    return () => {
      generation.current++;
      const connecting = pending.current;
      pending.current = undefined;
      if (connecting?.supportedChains.includes('bitcoin-cash')) {
        void connecting.disconnect().catch(() => {
          // Selection cleanup must not expose SDK errors or publish stale state.
        });
      }
    };
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

  return <WalletContext value={value}>{children}</WalletContext>;
};
