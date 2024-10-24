import { useState } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';

import useNetwork from './useNetwork';
import useTransactionFormData from './useTransactionFormData';
import useWallet from './useWallet';
import { getNonDecimalString } from '@rosen-ui/utils';
import { useTokenMap } from './useTokenMap';
import { RosenAmountValue } from '@rosen-ui/types';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  const tokenMap = useTokenMap();
  const { selectedNetwork, selectedTargetNetwork } = useNetwork();
  const { targetValue, tokenValue, amountValue, walletAddressValue } =
    useTransactionFormData();

  const { selectedWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockAddress = selectedNetwork?.lockAddress ?? '';

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
      selectedTargetNetwork
    ) {
      setIsSubmitting(true);
      try {
        const amountValueWrapped = BigInt(
          getNonDecimalString(
            amountValue as string,
            tokenMap.getSignificantDecimals(tokenValue.tokenId) || 0,
          ),
        );
        const txId = await selectedWallet?.transfer(
          tokenValue as RosenChainToken,
          amountValueWrapped,
          targetValue,
          selectedTargetNetwork.toSafeAddress(walletAddressValue),
          bridgeFee,
          networkFee,
          lockAddress,
        );
        openSnackbar(`Transaction submitted with id [${txId}]`, 'success');
      } catch (error) {
        /**
         * FIXME: Customize error messages based on error data
         * local:ergo/rosen-bridge/ui#169
         */
        if (error instanceof Error) {
          openSnackbar(
            `An error occurred during submission: ${error.message}`,
            'error',
          );
        } else {
          openSnackbar(`An unknown error occurred: ${error}`, 'error');
        }
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
