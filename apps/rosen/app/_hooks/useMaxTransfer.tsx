import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';

import { RosenAmountValue } from '@rosen-ui/types';

import { getMaxTransfer } from '@/_utils';

import { useBalance } from './useBalance';
import { useNetwork } from './useNetwork';
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
  load: () => void;
};

export const MaxTransferContext = createContext<MaxTransferContextType | null>(
  null,
);

export const MaxTransferProvider = ({ children }: { children: ReactNode }) => {
  const { isLoading: isBalanceLoading, amount: balanceAmount } = useBalance();

  const { selectedSource } = useNetwork();

  const { targetValue, tokenValue, walletAddressValue } =
    useTransactionFormData();

  const { selectedWallet } = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>();

  const [isTransitionLoading, startTransition] = useTransition();

  const isLoading = isBalanceLoading || isTransitionLoading;

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
        const amount = await getMaxTransfer(
          selectedSource,
          {
            balance: balanceAmount,
            isNative: tokenValue.metaData.type === 'native',
          },
          async () => ({
            fromAddress: await selectedWallet.getAddress(),
            toAddress: walletAddressValue,
            toChain: targetValue,
          }),
        );

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
    load,
  };

  return (
    <MaxTransferContext.Provider value={state}>
      {children}
    </MaxTransferContext.Provider>
  );
};
