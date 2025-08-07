import {
  PropsWithChildren,
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

const MaxTransferContext = createContext<MaxTransferContextType | null>(null);

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

export const MaxTransferProvider = ({ children }: PropsWithChildren) => {
  const balance = useBalance();

  const network = useNetwork();

  const tokenMap = useTokenMap();

  const transactionFormData = useTransactionFormData();

  const wallet = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>();

  const [isTransitionLoading, startTransition] = useTransition();

  const isLoading = balance.isLoading || isTransitionLoading;

  const raw = useMemo(() => {
    if (!amount || !tokenMap || !transactionFormData.tokenValue) return '0';
    return getDecimalString(
      amount.toString(),
      tokenMap.getSignificantDecimals(transactionFormData.tokenValue.tokenId) ||
        0,
    );
  }, [amount, tokenMap, transactionFormData.tokenValue]);

  const load = useCallback(() => {
    setAmount(0n);

    setError(null);

    if (
      !balance.amount ||
      balance.isLoading ||
      !network.selectedSource ||
      !transactionFormData.targetValue ||
      !transactionFormData.tokenValue ||
      !wallet.selected ||
      transactionFormData.formState.errors?.walletAddress
    )
      return;

    startTransition(async () => {
      try {
        const amount = await network.selectedSource!.getMaxTransfer({
          balance: balance.amount,
          isNative: transactionFormData.tokenValue.type === 'native',
          eventData: {
            fromAddress: await wallet.selected!.getAddress(),
            toAddress: transactionFormData.walletAddressValue,
            toChain: transactionFormData.targetValue!,
          },
        });

        setAmount(amount);
      } catch (error) {
        setError(error);
      }
    });
  }, [
    balance.amount,
    balance.isLoading,
    network.selectedSource,
    wallet.selected,
    transactionFormData.formState.errors,
    transactionFormData.targetValue,
    transactionFormData.tokenValue,
    transactionFormData.walletAddressValue,
  ]);

  useEffect(load, [load]);

  const state = useMemo<MaxTransferContextType>(
    () => ({
      amount,
      error,
      isLoading,
      raw,
      load,
    }),
    [amount, error, isLoading, raw, load],
  );

  return (
    <MaxTransferContext.Provider value={state}>
      {children}
    </MaxTransferContext.Provider>
  );
};
