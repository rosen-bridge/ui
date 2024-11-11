import { useMemo, useEffect, useRef, useCallback, useTransition } from 'react';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';

import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import useNetwork from './useNetwork';

import { calculateFee } from '@/_actions/calculateFee';

import { Network } from '@rosen-ui/types';
import { unwrap } from '@/_safeServerAction';
import { useTokenMap } from './useTokenMap';

/**
 * calculates the fees for a token swap between
 * two networks
 */
const useTransactionFees = (
  sourceChain: Network | null,
  targetChain: Network | null,
  token: RosenChainToken | null,
  amount: string | null,
) => {
  const [pending, startTransition] = useTransition();
  const { openSnackbar } = useSnackbar();
  const { selectedNetwork } = useNetwork();

  const feeInfo = useRef<any>(null);
  const tokenMap = useTokenMap();

  /**
   * finds and returns a token id based on supported networks
   */
  const getTokenId = useCallback(
    (sourceChain: Network, token: RosenChainToken) => {
      const idKey = tokenMap.getIdKey(sourceChain);
      const tokens = tokenMap.search(sourceChain, {
        [idKey]: token[idKey],
      });
      return tokens[0].ergo.tokenId;
    },
    [tokenMap],
  );

  /**
   * current selected token id
   */
  const tokenId = useMemo(() => {
    if (sourceChain && token) {
      return getTokenId(sourceChain, token);
    }
    return null;
  }, [getTokenId, sourceChain, token]);

  const decimals = useMemo(() => {
    if (!tokenId) return 0;
    return tokenMap.getSignificantDecimals(tokenId) || 0;
  }, [tokenId, tokenMap]);

  useEffect(() => {
    feeInfo.current = null;
  }, [sourceChain, targetChain, token]);

  /**
   * effect to fetch the fees as soon as all the required data is available
   */
  useEffect(() => {
    if (
      sourceChain &&
      targetChain &&
      tokenId &&
      selectedNetwork &&
      tokenId !== feeInfo.current?.tokenId &&
      !pending
    ) {
      startTransition(async () => {
        try {
          const parsedData = await unwrap(calculateFee)(
            sourceChain,
            targetChain,
            tokenId,
            selectedNetwork.nextHeightInterval,
          );

          const { fees, nextFees } = parsedData;

          if (
            fees.bridgeFee !== nextFees.bridgeFee ||
            fees.networkFee !== nextFees.networkFee
          ) {
            openSnackbar(
              'Fees might change depending on the height of mining the transactions.',
              'warning',
            );
          }

          feeInfo.current = {
            tokenId,
            status: 'success',
            data: parsedData,
          };
        } catch (error: any) {
          openSnackbar('something went wrong! please try again', 'error');
          feeInfo.current = {
            tokenId,
            status: 'error',
            message: error?.message || error,
          };
        }
      });
    }
  }, [
    sourceChain,
    targetChain,
    tokenId,
    openSnackbar,
    pending,
    feeInfo,
    selectedNetwork,
  ]);

  const fees = tokenId && feeInfo.current?.data?.fees;
  const feeRatioDivisor =
    tokenId && fees?.feeRatioDivisor ? BigInt(fees?.feeRatioDivisor) : 1n;

  const transactionFees = useMemo(() => {
    let paymentAmount = 0n;

    try {
      paymentAmount = BigInt(getNonDecimalString(amount!, decimals));
    } catch {}

    const networkFee = fees ? BigInt(fees.networkFee) : 0n;
    const feeRatio = fees ? BigInt(fees?.feeRatio) : 0n;

    const bridgeFeeBase = fees ? BigInt(fees.bridgeFee) : 0n;
    const variableBridgeFee = fees
      ? (paymentAmount * feeRatio) / feeRatioDivisor
      : 0n;
    const bridgeFee =
      bridgeFeeBase > variableBridgeFee ? bridgeFeeBase : variableBridgeFee;

    const receivingAmountValue = fees
      ? paymentAmount - (networkFee + bridgeFee!)
      : 0n;

    const minTransfer = bridgeFeeBase! + networkFee!;

    return {
      bridgeFee,
      bridgeFeeRaw: getDecimalString(bridgeFee?.toString() || '0', decimals),
      networkFee,
      networkFeeRaw: getDecimalString(networkFee?.toString() || '0', decimals),
      receivingAmount: receivingAmountValue,
      receivingAmountRaw:
        fees && receivingAmountValue > 0
          ? getDecimalString(receivingAmountValue.toString() || '0', decimals)
          : '0',
      minTransfer: minTransfer ? minTransfer + 1n || 0n : 0n,
      minTransferRaw: minTransfer
        ? getDecimalString((minTransfer + 1n).toString() || '0', decimals)
        : '0',
      isLoading: pending,
      status: feeInfo.current,
    };
  }, [amount, fees, pending, decimals, feeRatioDivisor]);

  return transactionFees;
};

export default useTransactionFees;
