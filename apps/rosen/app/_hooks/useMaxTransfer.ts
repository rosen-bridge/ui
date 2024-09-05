import { useEffect, useState, useTransition } from 'react';

import useNetwork from './useNetwork';
import useWallet from './useWallet';
import useBridgeForm from './useBridgeForm';
import useTokenBalance from './useTokenBalance';

import getMaxTransfer from '@/_utils/getMaxTransfer';
import { RosenAmountValue } from '@rosen-ui/types';

/**
 * a hook version of `getMaxTransfer` util
 * @returns CONTAINS A WRAPPED-VALUE
 */
const useMaxTransfer = () => {
  const [max, setMax] = useState<RosenAmountValue>(0n);
  const [loading, startTransition] = useTransition();

  const { isLoading: isTokenBalanceLoading, amount } = useTokenBalance();

  const { selectedNetwork } = useNetwork();

  const { targetField, tokenField, addressField } = useBridgeForm();

  const { selectedWallet } = useWallet();

  useEffect(() => {
    const effect = async () => {
      if (
        !selectedNetwork ||
        !selectedWallet ||
        isTokenBalanceLoading ||
        !tokenField.value
      )
        return;

      if (!amount) return;

      try {
        const max = await getMaxTransfer(
          selectedNetwork,
          {
            balance: amount,
            isNative: tokenField.value.metaData.type === 'native',
          },
          async () => ({
            fromAddress: await selectedWallet.getAddress(),
            toAddress: addressField.value,
            toChain: targetField.value,
          }),
        );
        setMax(max);
      } catch {}
    };

    startTransition(effect);
  }, [
    addressField.value,
    amount,
    isTokenBalanceLoading,
    selectedNetwork,
    selectedWallet,
    targetField.value,
    tokenField.value,
  ]);

  return {
    max,
    loading: loading || isTokenBalanceLoading,
  };
};

export default useMaxTransfer;
