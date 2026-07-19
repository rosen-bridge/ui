import React, { useState } from 'react';

import * as Sentry from '@sentry/nextjs';
import { serializeError } from 'serialize-error';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import { useToast } from '@rosen-bridge/ui-kit';
import { InsufficientAssetsError } from '@rosen-network/base/dist/handleUncoveredAssets';
import { getNonDecimalString, getTxURL } from '@rosen-ui/utils';
import {
  UserDeniedTransactionSignatureError,
  type WalletTransferParams,
} from '@rosen-ui/wallet-api';

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

  const toast = useToast();

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

    let parameters: WalletTransferParams | undefined;

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

      const result = await selectedWallet.transfer(parameters);

      const isQrCode = result.startsWith('qrcode:');

      if (isQrCode) {
        setIsSubmitting(false);
        return result;
      }

      toast.add({
        type: 'success',
        description: React.createElement('div', undefined, [
          'Transaction submitted successfully, click ',
          React.createElement(
            'a',
            {
              href: getTxURL(sourceValue, result),
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
      });

      // biome-ignore lint/suspicious/noExplicitAny: Use a better type
    } catch (error: any) {
      toast.add({
        type: 'error',
        description: error?.info ?? error?.message ?? JSON.stringify(error),
        more: () => JSON.stringify(serializeError(error), null, 2),
      });

      if (error instanceof InsufficientAssetsError) return;

      if (error instanceof UserDeniedTransactionSignatureError) return;

      Sentry.withScope((scope) => {
        scope.setTag('feature', 'transaction');
        scope.setTag('wallet', selectedWallet.name);

        scope.setContext('transaction', { parameters: parameters });

        Sentry.captureException(error);
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
