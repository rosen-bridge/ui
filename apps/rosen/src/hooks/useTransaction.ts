import { useState } from 'react';
import React from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import { InsufficientAssetsError } from '@rosen-network/base/dist/handleUncoveredAssets';
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
import { useWallet } from './useWallet';
import { useBridgeFormValues } from './useBridgeFormValues';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  const { selectedSource, selectedTarget } = useNetwork();

  const { openSnackbar } = useSnackbar();

  const tokenMap = useTokenMap();

  const { networkFee, bridgeFee } = useTransactionFees();

  const bridgeFormValues = useBridgeFormValues();

  const { selected: selectedWallet } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTransaction = async () => {
    if (
      !bridgeFormValues.amount ||
      !bridgeFee ||
      !networkFee ||
      !bridgeFormValues.source ||
      !bridgeFormValues.target ||
      !tokenMap ||
      !bridgeFormValues.token ||
      !selectedSource ||
      !selectedTarget ||
      !selectedWallet ||
      !bridgeFormValues.walletAddress
    )
      return;

    setIsSubmitting(true);

    let parameters: WalletTransferParams | undefined = undefined;

    try {
      parameters = {
        token: bridgeFormValues.token as RosenChainToken,
        amount: BigInt(
          getNonDecimalString(
            bridgeFormValues.amount,
            tokenMap.getSignificantDecimals(bridgeFormValues.token.tokenId) || 0,
          ),
        ),
        fromChain: bridgeFormValues.source,
        toChain: bridgeFormValues.target,
        address: selectedTarget.toSafeAddress(bridgeFormValues.walletAddress),
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
              href: getTxURL(bridgeFormValues.source, txId),
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      openSnackbar(
        error?.info ?? error?.message ?? JSON.stringify(error),
        'error',
        undefined,
        () => JSON.stringify(serializeError(error), null, 2),
      );

      if (error instanceof InsufficientAssetsError) return;

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
