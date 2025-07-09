import { useState } from 'react';

import { useSnackbar } from '@rosen-bridge/ui-kit';
import { getNonDecimalString } from '@rosen-ui/utils';
import {
  UserDeniedTransactionSignatureError,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';
import { serializeError } from 'serialize-error';

import { logger } from '@/_actions';

import { useBridgeForm } from './useBridgeForm';
import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useTransactionFees } from './useTransactionFees';
import { useTransactionFormData } from './useTransactionFormData';
import { useWallet } from './useWallet';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  const {
    formValues: { source, target, token, walletAddress },
  } = useBridgeForm();
  const { selectedSource, selectedTarget } = useNetwork();

  const { openSnackbar } = useSnackbar();

  const tokenMap = useTokenMap();

  const { networkFee, bridgeFee } = useTransactionFees();

  const { amountValue } = useTransactionFormData();

  const { selected: selectedWallet } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTransaction = async () => {
    if (
      !amountValue ||
      !bridgeFee ||
      !networkFee ||
      !source ||
      !target ||
      !tokenMap ||
      !token ||
      !selectedSource ||
      !selectedTarget ||
      !selectedWallet ||
      !walletAddress
    )
      return;

    setIsSubmitting(true);

    let parameters: WalletTransferParams | undefined = undefined;

    try {
      parameters = {
        token: token,
        amount: BigInt(
          getNonDecimalString(
            amountValue as string,
            tokenMap.getSignificantDecimals(token.tokenId) || 0,
          ),
        ),
        fromChain: source.name,
        toChain: target.name,
        address: selectedTarget.toSafeAddress(walletAddress),
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
        undefined,
        () => JSON.stringify(serializeError(error), null, 2),
      );

      if (error instanceof UserDeniedTransactionSignatureError) return;

      logger('transfer', parameters, serializeError(error))
        .then(() => {})
        .catch((error) => {
          console.log('Failed to send log to Discord', error);
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    startTransaction,
    isSubmitting,
  };
};
