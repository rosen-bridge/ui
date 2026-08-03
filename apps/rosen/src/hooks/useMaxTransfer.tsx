import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import type { RosenAmountValue } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import { useBalance } from './useBalance';
import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';
import { useWallet } from './useWallet';

export type MaxTransferState = {
  amount: RosenAmountValue;
  error: unknown;
  isLoading: boolean;
  raw: string;
  load: () => void;
};

export const useMaxTransfer = (): MaxTransferState => {
  const balance = useBalance();

  const network = useNetwork();

  const tokenMap = useTokenMap();

  const transactionFormData = useTransactionFormData();

  const wallet = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>(null);

  const [isTransitionLoading, startTransition] = useTransition();

  const isLoading = balance.isLoading || isTransitionLoading;

  const raw = useMemo(() => {
    if (!amount || !tokenMap || !transactionFormData.tokenValue) return '0';
    return getDecimalString(
      amount,
      tokenMap.getSignificantDecimals(transactionFormData.tokenValue.tokenId),
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
      if (
        !network.selectedSource ||
        !transactionFormData.targetValue ||
        !wallet.selected
      )
        return;
      try {
        const amount = await network.selectedSource.getMaxTransfer({
          balance: balance.amount,
          isNative: transactionFormData.tokenValue.type === 'native',
          eventData: {
            fromAddress: await wallet.selected.getAddress(),
            toAddress: transactionFormData.walletAddressValue,
            toChain: transactionFormData.targetValue,
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

  return useMemo(
    () => ({ amount, error, isLoading, raw, load }),
    [amount, error, isLoading, raw, load],
  );
};
