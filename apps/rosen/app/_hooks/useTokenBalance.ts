import { useState, useEffect, useCallback } from 'react';

import { TokenInfo } from '@rosen-ui/types';

import useBridgeForm from './useBridgeForm';
import useWallet from './useWallet';

import { SupportedWallets } from '@/_types/network';

interface UseTokenBalance {
  isLoading: boolean;

  // THIS IS A WRAPPED-VALUE
  amount: number;

  token: TokenInfo | null;
}

/**
 * returns the amount of currently selected asset
 * @returns CONTAINS A WRAPPED-VALUE
 */
const useTokenBalance = () => {
  const [balanceState, setBalanceState] = useState<UseTokenBalance>({
    isLoading: false,
    amount: 0,
    token: null,
  });

  const { tokenField } = useBridgeForm();

  const { selectedWallet } = useWallet();

  const token = tokenField.value;

  const getAssetBalance = useCallback(
    async (wallet: SupportedWallets) => {
      setBalanceState({ isLoading: true, amount: 0, token: null });

      // THIS IS A WRAPPED-VALUE
      const balance = Number(await wallet.getBalance(token));

      setBalanceState({ isLoading: false, amount: balance || 0, token });
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      setBalanceState({ isLoading: false, amount: 0, token: null });
    }
  }, [token]);

  useEffect(() => {
    const effect = async () => {
      if (
        selectedWallet &&
        tokenField.value &&
        !balanceState.isLoading &&
        (balanceState.token !== token ||
          balanceState.amount !==
            Number(await selectedWallet.getBalance(token)))
      )
        getAssetBalance(selectedWallet);
    };

    effect();
  }, [selectedWallet, getAssetBalance, tokenField, balanceState, token]);

  return balanceState;
};

export default useTokenBalance;
