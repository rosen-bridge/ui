import { useCallback, useEffect, useState, useTransition } from 'react';

import { RosenAmountValue } from '@rosen-ui/types';

import { Networks } from '@rosen-ui/constants';

import useNetwork from './useNetwork';
import useTokenBalance from './useTokenBalance';
import useTransactionFormData from './useTransactionFormData';
import useWallet from './useWallet';

/**
 * Manage the maximum transferable amount.
 */
export const useMaxTransfer = () => {
  const [error, setError] = useState(false);

  const [max, setMax] = useState<RosenAmountValue>(0n);

  const [isTransitionLoading, startTransition] = useTransition();

  const { targetValue, tokenValue, walletAddressValue } =
    useTransactionFormData();

  const { selectedNetwork } = useNetwork();

  const { isLoading: isTokenBalanceLoading, amount } = useTokenBalance();

  const { selectedWallet } = useWallet();

  const loading = isTokenBalanceLoading || isTransitionLoading;

  const load = useCallback(async () => {
    const skip =
      !amount ||
      isTokenBalanceLoading ||
      !selectedNetwork ||
      !selectedWallet ||
      !tokenValue;

    if (skip) return;

    setError(false);

    try {
      let eventData: any;

      if (selectedNetwork.name === Networks.BITCOIN) {
        eventData = {
          fromAddress: await selectedWallet.getAddress(),
          toAddress: walletAddressValue,
          toChain: targetValue,
        };
      }

      const max = await selectedNetwork.getMaxTransfer({
        balance: amount,
        isNative: tokenValue.metaData.type === 'native',
        eventData,
      });

      setMax(max);
    } catch {
      setError(true);
    }
  }, [
    amount,
    isTokenBalanceLoading,
    selectedNetwork,
    selectedWallet,
    targetValue,
    tokenValue,
    walletAddressValue,
  ]);

  useEffect(() => startTransition(load), [load]);

  return {
    error,
    loading,
    max,
    load: () => startTransition(load),
  };
};
