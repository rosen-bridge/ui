import { useState, useEffect, useCallback } from 'react';

import { TokenInfo } from '@rosen-ui/types';
import { RosenAmountValue } from '@rosen-ui/types';
import { Wallet } from '@rosen-ui/wallet-api';

import useBridgeForm from './useBridgeForm';
import useWallet from './useWallet';

interface UseTokenBalance {
  isLoading: boolean;
  // THIS IS A WRAPPED-VALUE
  amount: RosenAmountValue;
  token: TokenInfo | null;
}

/**
 * returns the amount of currently selected asset
 * @returns CONTAINS A WRAPPED-VALUE
 */
const useTokenBalance = () => {
  const [balanceState, setBalanceState] = useState<UseTokenBalance>({
    isLoading: false,
    amount: 0n,
    token: null,
  });

  const { tokenField } = useBridgeForm();

  const { selectedWallet } = useWallet();

  const token = tokenField.value;

  const getAssetBalance = useCallback(
    async (wallet: Wallet) => {
      setBalanceState({ isLoading: true, amount: 0n, token: null });
      // THIS IS A WRAPPED-VALUE
      const balance = await wallet.getBalance(token);
      setBalanceState({ isLoading: false, amount: balance || 0n, token });
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      setBalanceState({ isLoading: false, amount: 0n, token: null });
    }
  }, [token]);

  useEffect(() => {
    const effect = async () => {
      if (
        selectedWallet &&
        tokenField.value &&
        !balanceState.isLoading &&
        (balanceState.token !== token ||
          // THIS IS A WRAPPED-VALUE
          balanceState.amount !== (await selectedWallet.getBalance(token)))
      )
        getAssetBalance(selectedWallet);
    };

    effect();
  }, [selectedWallet, getAssetBalance, tokenField, balanceState, token]);

  return balanceState;
};

export default useTokenBalance;
