import { useState } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import { RosenAmountValue } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';

import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';
import { useWallet } from './useWallet';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  const tokenMap = useTokenMap();
  const { selectedSource, selectedTarget } = useNetwork();
  const { targetValue, tokenValue, amountValue, walletAddressValue } =
    useTransactionFormData();

  const { selectedWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockAddress = selectedSource?.lockAddress ?? '';

  const { openSnackbar } = useSnackbar();

  const startTransaction = async (
    bridgeFee: RosenAmountValue,
    networkFee: RosenAmountValue,
  ) => {
    if (
      tokenValue &&
      targetValue &&
      amountValue &&
      walletAddressValue &&
      bridgeFee &&
      networkFee &&
      tokenMap &&
      selectedTarget
    ) {
      setIsSubmitting(true);
      try {
        const amountValueWrapped = BigInt(
          getNonDecimalString(
            amountValue as string,
            tokenMap.getSignificantDecimals(tokenValue.tokenId) || 0,
          ),
        );
        const txId = await selectedWallet?.transfer({
          token: tokenValue as RosenChainToken,
          amount: amountValueWrapped,
          toChain: targetValue,
          address: selectedTarget.toSafeAddress(walletAddressValue),
          bridgeFee,
          networkFee,
          lockAddress,
        });
        openSnackbar(`Transaction submitted with id [${txId}]`, 'success');
      } catch (error: any) {
        openSnackbar(
          error?.info ?? error?.message ?? JSON.stringify(error),
          'error',
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    startTransaction,
    isSubmitting,
  };
};
