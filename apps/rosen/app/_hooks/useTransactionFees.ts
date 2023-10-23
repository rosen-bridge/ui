import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from 'react';
// import { BridgeMinimumFee } from '@rosen-bridge/minimum-fee-browser';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import useChainHeight from './useChainHeight';
import { useTokensMap } from './useTokensMap';

import { feeCalculator } from '@/_actions/feeCalculator';

import { Networks } from '@/_constants';

/**
 * calculates the fees for a token swap between
 * two networks
 */
const useTransactionFees = (
  sourceChain: keyof typeof Networks | null,
  token: RosenChainToken | null,
  amount: string | null,
) => {
  const [pending, startTransition] = useTransition();
  const { openSnackbar } = useSnackbar();
  const { height, isLoading: isLoadingHeights } = useChainHeight();

  const feeInfo = useRef<any>(null);
  const tokensMap = useTokensMap();

  /**
   * finds and returns a toke id based on supported networks
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

  /**
   * effect to fetch the fess as soon as all the required data is available
   */
  useEffect(() => {
    if (
      sourceChain &&
      tokenId &&
      height &&
      tokenId !== feeInfo.current?.tokenId &&
      !pending
    ) {
      startTransition(async () => {
        const data = await feeCalculator(sourceChain, tokenId, height);
        if (data.status === 'success') {
          const parsedData = {
            ...data,
            data: JsonBigInt.parse(data.data!),
          };
          const { fees, nextFees } = parsedData.data;
          if (
            fees.bridgeFee !== nextFees.bridgeFee ||
            fees.networkFee !== nextFees.networkFee
          ) {
            openSnackbar(
              'Fees might change depending on the height of mining the transactions.',
              'warning',
            );
          }
          feeInfo.current = parsedData;
        } else if (data.status === 'error') {
          openSnackbar('something went wrong! please try again', 'error');
          feeInfo.current = data;
        }
      });
    }
  }, [sourceChain, tokenId, height, openSnackbar, pending, feeInfo]);

  const isLoading = pending || isLoadingHeights;

  const fees = feeInfo.current?.data?.fees;
  const feeRatioDivisor = feeInfo.current
    ? Number(feeInfo.current.feeRatioDivisor)
    : 1;

  // TODO: revalidate the transactions Formula
  // local:ergo/rosen-bridge/ui/-/issues/87
  const transactionFees = useMemo(() => {
    let paymentAmount =
      amount && token
        ? +getNonDecimalString(amount.toString(), token.decimals)
        : 0;

    const networkFee = fees ? Number(fees.networkFee) : 0;
    const feeRatio = fees ? Number(fees?.feeRatio) : 0;

    const bridgeFeeBase = fees ? Number(fees.bridgeFee) : 0;
    const variableBridgeFee = fees
      ? (paymentAmount * feeRatio) / feeRatioDivisor
      : 0;
    const bridgeFee = Math.max(bridgeFeeBase, variableBridgeFee);

    const ratioBasedMinTransferAmount =
      (feeRatioDivisor * networkFee) / (feeRatioDivisor - feeRatio);

    const receivingAmountValue = fees
      ? +paymentAmount - (networkFee! + bridgeFee!)
      : 0;

    const minTransferAmountValue = fees
      ? Math.max(bridgeFee! + networkFee!, ratioBasedMinTransferAmount)
      : 0n;

    return {
      bridgeFee: getDecimalString(
        bridgeFee?.toString() || '0',
        token?.decimals || 1,
      ),
      networkFee: getDecimalString(
        networkFee?.toString() || '0',
        token?.decimals || 1,
      ),
      receivingAmount:
        fees && receivingAmountValue > 0
          ? getDecimalString(
              receivingAmountValue.toString() || '0',
              token?.decimals || 0,
            )
          : '0',
      minTransferAmount: minTransferAmountValue
        ? getDecimalString(
            minTransferAmountValue.toString() || '0',
            token?.decimals || 0,
          )
        : '0',
      isLoading,
      status: feeInfo.current,
    };
  }, [amount, fees, isLoading, token, feeRatioDivisor]);

  return transactionFees;
};

export default useTransactionFees;
