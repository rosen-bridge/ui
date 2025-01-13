import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';

import { RosenAmountValue } from '@rosen-ui/types';

import { useBridgeForm } from './useBridgeForm';
import { useWallet } from './useWallet';

/**
 * returns the amount of currently selected asset
 */
export const useBalance = () => {
  const context = useContext(BalanceContext);

  if (!context) {
    throw new Error('useBalance must be used within BalanceProvider');
  }

  return context;
};

export type BalanceContextType = {
  amount: RosenAmountValue;
  error: unknown;
  isLoading: boolean;
};

export const BalanceContext = createContext<BalanceContextType | null>(null);

export const BalanceProvider = ({ children }: PropsWithChildren) => {
  const {
    tokenField: { value: token },
  } = useBridgeForm();

  const { selectedWallet } = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>();

  const [isLoading, startTransition] = useTransition();

  const load = useCallback(() => {
    setAmount(0n);

    setError(null);

    if (!selectedWallet || !token) return;

    startTransition(async () => {
      try {
        setAmount(await selectedWallet.getBalance(token));
      } catch (error) {
        setError(error);
      }
    });
  }, [selectedWallet, token]);

  useEffect(load, [load]);

  const state = {
    amount,
    error,
    isLoading,
  };

  return (
    <BalanceContext.Provider value={state}>{children}</BalanceContext.Provider>
  );
};
