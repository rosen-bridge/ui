import { useState } from 'react';
import React from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import { getNonDecimalString, getTxURL } from '@rosen-ui/utils';
import {
  UserDeniedTransactionSignatureError,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';
import { serializeError } from 'serialize-error';

import { logger } from '@/actions';

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

  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    walletAddressValue,
  } = useTransactionFormData();

  const { selected: selectedWallet } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTransaction = async () => {
    if (
      !amountValue ||
      !bridgeFee ||
      !networkFee ||
      !sourceValue ||
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

    let parameters: WalletTransferParams | undefined = undefined;

    try {
      parameters = {
        token: tokenValue as RosenChainToken,
        amount: BigInt(
          getNonDecimalString(
            amountValue as string,
            tokenMap.getSignificantDecimals(tokenValue.tokenId) || 0,
          ),
        ),
        fromChain: sourceValue,
        toChain: targetValue,
        address: selectedTarget.toSafeAddress(walletAddressValue),
        bridgeFee,
        networkFee,
        lockAddress: selectedSource.lockAddress,
      };

      const txId = await selectedWallet.transfer(parameters);

      openSnackbar(
        React.createElement('div', undefined, [
          'Transaction submitted successfully, click ',
          React.createElement(
            'a',
            {
              href: getTxURL(sourceValue, txId),
              target: '_blank',
              style: {
                color: 'inherit',
                fontWeight: 'bold',
              },
            },
            ['here'],
          ),
          ' to see more details.',
        ]),
        'success',
      );
      // eslint-disable-next-line
    } catch (error: any) {
      openSnackbar(
        error?.info ?? error?.message ?? JSON.stringify(error),
        'error',
        undefined,
        () => JSON.stringify(serializeError(error), null, 2),
      );

      if (error instanceof UserDeniedTransactionSignatureError) return;

      logger(
        `${selectedWallet.name}:transfer`,
        parameters,
        serializeError(error),
      )
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
