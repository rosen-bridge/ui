import { useState } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';

import useLockAddress from './useLockAddress';
import useTransactionFormData from './useTransactionFormData';
import useWallet from './useWallet';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  const { targetValue, tokenValue, amountValue, walletAddressValue } =
    useTransactionFormData();

  const { selectedWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockAddress = useLockAddress();

  const { openSnackbar } = useSnackbar();

  const startTransaction = async (bridgeFee: number, networkFee: number) => {
    if (
      tokenValue &&
      targetValue &&
      amountValue &&
      walletAddressValue &&
      bridgeFee &&
      networkFee
    ) {
      setIsSubmitting(true);
      try {
        const txId = await selectedWallet?.transfer(
          tokenValue as RosenChainToken,
          amountValue,
          targetValue,
          walletAddressValue,
          bridgeFee,
          networkFee,
          lockAddress,
        );
        openSnackbar(`Transaction submitted with id [${txId}]`, 'success');
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
