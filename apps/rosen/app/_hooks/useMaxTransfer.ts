import { useEffect, useState } from 'react';

import useNetwork from './useNetwork';
import useWallet from './useWallet';
import useBridgeForm from './useBridgeForm';
import useTokenBalance from './useTokenBalance';

import getMaxTransfer from '@/_utils/getMaxTransfer';

/**
 * a hook version of `getMaxTransfer` util
 * @returns CONTAINS A WRAPPED-VALUE
 */
const useMaxTransfer = () => {
  const [max, setMax] = useState(0);
  const [loading, setLoading] = useState(false);

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

      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    effect();
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
