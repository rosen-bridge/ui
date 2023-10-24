import { useState, useEffect, useCallback } from 'react';
import { SupportedWallets } from '@/_types/network';

import useBridgeForm from './useBridgeForm';
import useWallet from './useWallet';

/**
 * returns the amount of currently selected asset
 */

const useTokenBalance = () => {
  const [balanceState, setBalanceState] = useState({
    isLoading: false,
    amount: 0,
    token: null,
  });
  // const { openSnackbar } = useSnackbar();

  const { tokenField } = useBridgeForm();

  const { selectedWallet } = useWallet();

  const token = tokenField.value;

  const getAssetBalance = useCallback(
    async (wallet: SupportedWallets) => {
      setBalanceState({ isLoading: true, amount: 0, token: null });
      const balance = await wallet.getBalance(token);
      setBalanceState({ isLoading: false, amount: +(balance || 0), token });
    },
    [token],
  );

  useEffect(() => {
    if (
      selectedWallet &&
      tokenField.value &&
      !balanceState.isLoading &&
      balanceState.token !== token
    )
      getAssetBalance(selectedWallet);
  }, [selectedWallet, getAssetBalance, tokenField, balanceState, token]);

  return balanceState;
};

export default useTokenBalance;
