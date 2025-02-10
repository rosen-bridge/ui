import { useState } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import { getNonDecimalString } from '@rosen-ui/utils';

import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useTransactionFees } from './useTransactionFees';
import { useTransactionFormData } from './useTransactionFormData';
import { useWallet } from './useWallet';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  const { selectedSource, selectedTarget } = useNetwork();

  const { openSnackbar } = useSnackbar();

  const tokenMap = useTokenMap();

  const { networkFee, bridgeFee } = useTransactionFees();

  const { targetValue, tokenValue, amountValue, walletAddressValue } =
    useTransactionFormData();

  const { selected: selectedWallet } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTransaction = async () => {
    if (
      !amountValue ||
      !bridgeFee ||
      !networkFee ||
      !targetValue ||
      !tokenMap ||
      !tokenValue ||
      !selectedSource ||
      !selectedTarget ||
      !selectedWallet ||
      !walletAddressValue
    )
      return;

    setIsSubmitting(true);

    try {
      const parameters = {
        token: tokenValue as RosenChainToken,
        amount: BigInt(
          getNonDecimalString(
            amountValue as string,
            tokenMap.getSignificantDecimals(tokenValue.tokenId) || 0,
          ),
        ),
        toChain: targetValue,
        address: selectedTarget.toSafeAddress(walletAddressValue),
        bridgeFee,
        networkFee,
        lockAddress: selectedSource.lockAddress,
      };

      const txId = await selectedWallet.transfer(parameters);

      openSnackbar(`Transaction submitted with id [${txId}]`, 'success');
    } catch (error: any) {
      openSnackbar(
        error?.info ?? error?.message ?? JSON.stringify(error),
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    startTransaction,
    isSubmitting,
  };
};
