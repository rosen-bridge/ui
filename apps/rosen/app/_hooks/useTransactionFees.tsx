import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { useSnackbar } from '@rosen-bridge/ui-kit';
import { RosenAmountValue } from '@rosen-ui/types';
import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import { calculateFee } from '@/_actions';
import { unwrap } from '@/_safeServerAction';

import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';

/**
 * calculates the fees for a token swap between
 * two networks
 */
export const useTransactionFees = () => {
  const context = useContext(TransactionFeesContext);

  if (!context) {
    throw new Error(
      'useTransactionFees must be used within TransactionFeesProvider',
    );
  }

  return context;
};

export type TransactionFeesContextType = {
  bridgeFee: RosenAmountValue;
  bridgeFeeRaw: string;
  networkFee: RosenAmountValue;
  networkFeeRaw: string;
  receivingAmount: RosenAmountValue;
  receivingAmountRaw: string;
  minTransfer: RosenAmountValue;
  minTransferRaw: string;
  error: unknown;
  isLoading: boolean;
};

export const TransactionFeesContext =
  createContext<TransactionFeesContextType | null>(null);

export const TransactionFeesProvider = ({ children }: PropsWithChildren) => {
  const { selectedSource } = useNetwork();

  const { openSnackbar } = useSnackbar();

  const tokenMap = useTokenMap();

  const { sourceValue, targetValue, tokenValue, amountValue } =
    useTransactionFormData();

  const [error, setError] = useState<unknown>();

  const [feesInfo, setFeesInfo] = useState<{
    tokenId: string;
    bridgeFee?: RosenAmountValue;
    networkFee?: RosenAmountValue;
  }>();

  const [isLoading, startTransition] = useTransition();

  const tokenId = useMemo(() => {
    if (!sourceValue || !tokenValue) return;

    const idKey = tokenMap.getIdKey(sourceValue);

    const tokens = tokenMap.search(sourceValue, { [idKey]: tokenValue[idKey] });

    return tokens[0].ergo.tokenId as string;
  }, [sourceValue, tokenValue, tokenMap]);

  const decimals = useMemo(() => {
    if (!tokenId) return 0;
    return tokenMap.getSignificantDecimals(tokenId) || 0;
  }, [tokenId, tokenMap]);

  const state = useMemo(() => {
    const fees = Object.assign(
      {
        bridgeFee: 0n,
        feeRatio: 0n,
        feeRatioDivisor: 1n,
        networkFee: 0n,
      },
      feesInfo,
    );

    const paymentAmount = (() => {
      try {
        return BigInt(getNonDecimalString(amountValue, decimals));
      } catch {
        return 0n;
      }
    })();

    const variableBridgeFee =
      (paymentAmount * fees.feeRatio) / fees.feeRatioDivisor;

    const bridgeFee =
      fees.bridgeFee > variableBridgeFee ? fees.bridgeFee : variableBridgeFee;

    const bridgeFeeRaw = getDecimalString(bridgeFee.toString(), decimals);

    const networkFee = fees.networkFee;

    const networkFeeRaw = getDecimalString(
      fees.networkFee.toString(),
      decimals,
    );

    const receivingAmount = feesInfo
      ? paymentAmount - (fees.networkFee + bridgeFee!)
      : 0n;

    const receivingAmountRaw =
      receivingAmount > 0
        ? getDecimalString(receivingAmount.toString(), decimals)
        : '0';

    const minTransferBase = fees.bridgeFee + fees.networkFee;

    const minTransfer = minTransferBase ? minTransferBase + 1n : 0n;

    const minTransferRaw = getDecimalString(minTransfer.toString(), decimals);

    return {
      bridgeFee,
      bridgeFeeRaw,
      networkFee,
      networkFeeRaw,
      receivingAmount,
      receivingAmountRaw,
      minTransfer,
      minTransferRaw,
      error,
      isLoading,
    };
  }, [amountValue, decimals, error, feesInfo, isLoading]);

  const load = useCallback(() => {
    if (isLoading) return;

    setError(undefined);

    setFeesInfo(undefined);

    if (!selectedSource || !sourceValue || !targetValue || !tokenId) return;

    startTransition(async () => {
      try {
        const parsedData = await unwrap(calculateFee)(
          sourceValue,
          targetValue,
          tokenId,
          selectedSource.nextHeightInterval,
        );

        if (
          parsedData.fees.bridgeFee !== parsedData.nextFees.bridgeFee ||
          parsedData.fees.networkFee !== parsedData.nextFees.networkFee
        ) {
          openSnackbar(
            'Fees might change depending on the height of mining the transactions.',
            'warning',
          );
        }

        setFeesInfo({ tokenId, ...parsedData.fees });
      } catch (error) {
        setFeesInfo({ tokenId });

        openSnackbar('something went wrong! please try again', 'error');

        setError(error);
      }
    });
  }, [
    isLoading,
    selectedSource,
    sourceValue,
    targetValue,
    tokenId,
    openSnackbar,
  ]);

  useEffect(() => {
    if (tokenId && tokenId !== feesInfo?.tokenId) {
      load();
    }
  }, [feesInfo, tokenId, load]);

  useEffect(() => {
    setFeesInfo(undefined);
  }, [sourceValue, targetValue, tokenValue]);

  return (
    <TransactionFeesContext.Provider value={state}>
      {children}
    </TransactionFeesContext.Provider>
  );
};
