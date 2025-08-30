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
import { NETWORKS } from '@rosen-ui/constants';
import { Wallet } from '@rosen-ui/wallet-api';

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

  const { openSnackbar } = useSnackbar();

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

        await wallet.connect();

        await wallet.switchChain(selectedSource.name);
      } catch (error: any) {
        setState('DISCONNECTED');
        return openSnackbar(error.message, 'error');
      }

      setSelected(wallet);
      setState('CONNECTED');

      localStorage.setItem('rosen:wallet:' + selectedSource.name, wallet.name);
    },
    [selectedSource, openSnackbar, setSelected, setState],
  );

  const disconnect = useCallback(async () => {
    if (!selected) return;

    if (!selectedSource) return;

    setState('DISCONNECTING');

    try {
      await selected.disconnect();
    } catch {}

    localStorage.removeItem('rosen:wallet:' + selectedSource.name);

    setSelected(undefined);
    setState('DISCONNECTED');
  }, [selected, selectedSource]);

  useEffect(() => {
    (async () => {
      setSelected(undefined);
      setState('IDLE');

      if (!selectedSource) return;

      setState('DISCONNECTED');

      const name = localStorage.getItem('rosen:wallet:' + selectedSource.name);

      if (!name) return;

      const wallet = Object.values(wallets).find(
        (wallet) => wallet.name == name,
      );

      if (!wallet || !wallet.isAvailable()) return;

      if (!(await wallet.isConnected())) return;

      try {
        setState('CONNECTING');

        await wallet.connect();

        await wallet.switchChain?.(selectedSource.name, true);

        setSelected(wallet);
        setState('CONNECTED');
      } catch (error) {
        setSelected(undefined);
        setState('DISCONNECTED');
        throw error;
      }
    })();
  }, [selectedSource, setSelected, setState]);

  /**
   * TODO: update or move this logic
   * local:ergo/rosen-bridge/ui#577
   */
  useEffect(() => {
    if (!selected) return;

    if (!selectedSource) return;

    if (selectedSource.name !== NETWORKS.bitcoin.key) return;

    if (selected.currentChain !== NETWORKS.bitcoin.key) return;

    const start = async () => {
      const address = await selected.getAddress();

      const isValid = address.toLowerCase().startsWith('bc1q');

      if (isValid) return;

      openSnackbar(
        'The source address of the selected wallet is not native SegWit (P2WPKH or P2WSH).',
        'error',
      );
    };

    start();
  }, [selected, selectedSource]);

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
