import { useCallback, useEffect, useState, useTransition } from 'react';

import { RosenAmountValue } from '@rosen-ui/types';

import { NETWORKS } from '@rosen-ui/constants';

import useNetwork from './useNetwork';
import useTokenBalance from './useTokenBalance';
import { getMaxTransfer } from '@/_utils';
import useTransactionFormData from './useTransactionFormData';
import useWallet from './useWallet';

/**
 * a hook version of `getMaxTransfer` util
 * @returns CONTAINS A WRAPPED-VALUE
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
      !targetValue ||
      !tokenValue;

    if (skip) return;

    setError(false);

    try {
      let eventData: any;

      if (selectedNetwork.name === NETWORKS.BITCOIN) {
        eventData = {
          fromAddress: await selectedWallet.getAddress(),
          toAddress: walletAddressValue,
          toChain: targetValue,
        };
      }

      const max = await getMaxTransfer(
        selectedNetwork,
        {
          balance: amount,
          isNative: tokenValue.metaData.type === 'native',
        },
        async () => ({
          fromAddress: await selectedWallet.getAddress(),
          toAddress: walletAddressValue,
          toChain: targetValue,
        }),
      );

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
