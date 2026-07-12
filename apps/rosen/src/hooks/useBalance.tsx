import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import type { RosenAmountValue } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import { useBridgeForm } from './useBridgeForm';
import { useTokenMap } from './useTokenMap';
import { useWallet } from './useWallet';

export type BalanceState = {
  amount: RosenAmountValue;
  error: unknown;
  isLoading: boolean;
  raw: string;
};

/**
 * returns the amount of currently selected asset
 */
export const useBalance = (): BalanceState => {
  const {
    tokenField: { value: token },
  } = useBridgeForm();

  const tokenMap = useTokenMap();

  const { selected: selectedWallet } = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>();

  const [isLoading, startTransition] = useTransition();

  const raw = useMemo(() => {
    if (!token) return '0';
    return getDecimalString(
      amount,
      tokenMap.getSignificantDecimals(token.tokenId),
    );
  }, [amount, tokenMap, token]);

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

  return {
    amount,
    error,
    isLoading,
    raw,
  };
};
