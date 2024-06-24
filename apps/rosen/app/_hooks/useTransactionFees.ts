import { useMemo, useEffect, useRef, useCallback, useTransition } from 'react';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import useNetwork from './useNetwork';
import { useTokensMap } from './useTokensMap';

import { calculateFee } from '@/_actions/calculateFee';

import { Networks } from '@/_constants';

/**
 * calculates the fees for a token swap between
 * two networks
 */
const useTransactionFees = (
  sourceChain: keyof typeof Networks | null,
  targetChain: keyof typeof Networks | null,
  token: RosenChainToken | null,
  amount: string | null,
) => {
  const [pending, startTransition] = useTransition();
  const { openSnackbar } = useSnackbar();
  const { selectedNetwork } = useNetwork();

  const feeInfo = useRef<any>(null);
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
        const data = await calculateFee(
          sourceChain,
          targetChain,
          tokenId,
          selectedNetwork.nextHeightInterval,
        );
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
    const bridgeFee = Math.max(bridgeFeeBase, Math.ceil(variableBridgeFee));

    const receivingAmountValue = fees
      ? +paymentAmount - (networkFee! + bridgeFee!)
      : 0;

    const minTransfer = bridgeFeeBase! + networkFee!;

    return {
      bridgeFee: getDecimalString(
        bridgeFee?.toString() || '0',
        token?.decimals || 0,
      ),
      networkFee: getDecimalString(
        networkFee?.toString() || '0',
        token?.decimals || 0,
      ),
      receivingAmount:
        fees && receivingAmountValue > 0
          ? getDecimalString(
              receivingAmountValue.toString() || '0',
              token?.decimals || 0,
            )
          : '0',
      minTransfer: minTransfer
        ? getDecimalString(
            (minTransfer + 1).toString() || '0',
            token?.decimals || 0,
          )
        : '0',
      isLoading: pending,
      status: feeInfo.current,
    };
  }, [amount, fees, pending, token, feeRatioDivisor]);

  return transactionFees;
};

export default useTransactionFees;
