import { useMemo, useEffect, useRef, useCallback, useTransition } from 'react';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import useNetwork from './useNetwork';
import { useTokensMap } from './useTokensMap';

import { calculateFee } from '@/_actions/calculateFee';

import { AvailableNetworks } from '@/_networks';
import { unwrap } from '@/_errors';
import { useTokenMap } from './useTokenMap';

/**
 * calculates the fees for a token swap between
 * two networks
 */
const useTransactionFees = (
  sourceChain: AvailableNetworks | null,
  targetChain: AvailableNetworks | null,
  token: RosenChainToken | null,
  amount: string | null,
) => {
  const [pending, startTransition] = useTransition();
  const { openSnackbar } = useSnackbar();
  const { selectedNetwork } = useNetwork();

  const feeInfo = useRef<any>(null);
  const tokenMap = useTokenMap();
  const tokensMap = useTokensMap();

  /**
   * finds and returns a token id based on supported networks
   */
  const getTokenId = useCallback(
    (sourceChain: string, token: RosenChainToken) => {
      const tokenMap = new TokenMap(tokensMap);
      const idKey = tokenMap.getIdKey(sourceChain);
      const tokens = tokenMap.search(sourceChain, {
        [idKey]: token[idKey],
      });
      return tokens[0].ergo.tokenId;
    },
    [tokensMap],
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
          const data = await unwrap(calculateFee)(
            sourceChain,
            targetChain,
            tokenId,
            selectedNetwork.nextHeightInterval,
          );

          const parsedData = JsonBigInt.parse(data);

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

  const fees = feeInfo.current?.data?.fees;
  const feeRatioDivisor = fees?.feeRatioDivisor
    ? Number(fees?.feeRatioDivisor)
    : 1;

  const transactionFees = useMemo(() => {
    let paymentAmount = amount
      ? +getNonDecimalString(amount.toString(), decimals)
      : 0;

    const networkFee = fees ? Number(fees.networkFee) : 0;
    const feeRatio = fees ? Number(fees?.feeRatio) : 0;

    const bridgeFeeBase = fees ? Number(fees.bridgeFee) : 0;
    const variableBridgeFee = fees
      ? (paymentAmount * feeRatio) / feeRatioDivisor
      : 0;
    const bridgeFee = Math.max(bridgeFeeBase, Math.ceil(variableBridgeFee));

    const receivingAmountValue = fees
      ? +paymentAmount - (networkFee! + bridgeFee!)
      : 0;

    const minTransfer = bridgeFeeBase! + networkFee!;

    return {
      bridgeFee: bridgeFee || 0,
      bridgeFeeRaw: getDecimalString(bridgeFee?.toString() || '0', decimals),
      networkFee: networkFee || 0,
      networkFeeRaw: getDecimalString(networkFee?.toString() || '0', decimals),
      receivingAmount:
        fees && receivingAmountValue > 0 ? receivingAmountValue || 0 : 0,
      receivingAmountRaw:
        fees && receivingAmountValue > 0
          ? getDecimalString(receivingAmountValue.toString() || '0', decimals)
          : '0',
      minTransfer: minTransfer ? minTransfer + 1 || 0 : 0,
      minTransferRaw: minTransfer
        ? getDecimalString((minTransfer + 1).toString() || '0', decimals)
        : '0',
      isLoading: pending,
      status: feeInfo.current,
    };
  }, [amount, fees, pending, decimals, feeRatioDivisor]);

  return transactionFees;
};

export default useTransactionFees;
