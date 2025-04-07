import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { RosenAmountValue } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import { useBalance } from './useBalance';
import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';
import { useWallet } from './useWallet';

/**
 * a hook version of `getMaxTransfer` util
 */
export const useMaxTransfer = () => {
  const context = useContext(MaxTransferContext);

  if (!context) {
    throw new Error('useMaxTransfer must be used within MaxTransferProvider');
  }

  return context;
};

export type MaxTransferContextType = {
  amount: RosenAmountValue;
  error: unknown;
  isLoading: boolean;
  raw: string;
  load: () => void;
};

export const MaxTransferContext = createContext<MaxTransferContextType | null>(
  null,
);

export const MaxTransferProvider = ({ children }: { children: ReactNode }) => {
  const { isLoading: isBalanceLoading, amount: balanceAmount } = useBalance();

  const { selectedSource } = useNetwork();

  const tokenMap = useTokenMap();

  const { targetValue, tokenValue, walletAddressValue } =
    useTransactionFormData();

  const { selected: selectedWallet } = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>();

  const [isTransitionLoading, startTransition] = useTransition();

  const isLoading = isBalanceLoading || isTransitionLoading;

  const raw = useMemo(() => {
    if (!amount || !tokenMap || !tokenValue) return '0';
    return getDecimalString(
      amount.toString(),
      tokenMap.getSignificantDecimals(tokenValue.tokenId) || 0,
    );
  }, [amount, tokenMap, tokenValue]);

  const load = useCallback(() => {
    setAmount(0n);

    setError(null);

    if (
      !balanceAmount ||
      isBalanceLoading ||
      !selectedSource ||
      !targetValue ||
      !tokenValue ||
      !selectedWallet
    )
      return;

    startTransition(async () => {
      try {
        const amount = await selectedSource.getMaxTransfer({
          balance: balanceAmount,
          isNative: tokenValue.type === 'native',
          eventData: {
            fromAddress: await selectedWallet.getAddress(),
            toAddress: walletAddressValue,
            toChain: targetValue,
          },
        });

        setAmount(amount);
      } catch (error) {
        setError(error);
      }
    });
  }, [
    balanceAmount,
    isBalanceLoading,
    selectedSource,
    selectedWallet,
    targetValue,
    tokenValue,
    walletAddressValue,
  ]);

  useEffect(load, [load]);

  const state = {
    amount,
    error,
    isLoading,
    raw,
    load,
  };

  return (
    <MaxTransferContext.Provider value={state}>
      {children}
    </MaxTransferContext.Provider>
  );
};
