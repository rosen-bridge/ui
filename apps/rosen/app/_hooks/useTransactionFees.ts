import {
  useState,
  useLayoutEffect,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import useSWR from 'swr';
import type { BridgeMinimumFee } from '@rosen-bridge/minimum-fee-browser';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';

import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import useChainHeight from './useChainHeight';
import { useTokensMap } from './useTokensMap';

import { getTokenNameAndId } from '@/_utils';

import {
  Networks,
  ergoFeeConfigTokenId,
  ergoExplorerUrl,
  cardanoFeeConfigTokenId,
  cardanoExplorerUrl,
  feeRatioDivisor,
  nextFeeHeight,
} from '@/_constants';

const bridgeFetcher =
  (BridgeMinimumFee: BridgeMinimumFee | null) =>
  async ([sourceChain, tokenId, height]: [
    string | null,
    string | null,
    number | null,
  ]) => {
    if (!sourceChain || !tokenId || !height || !BridgeMinimumFee) return null;
    const data = await BridgeMinimumFee.getFee(tokenId, sourceChain, height);
    return data;
  };

const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m));

/**
 * calculates the fees for a token swap between
 * two networks
 */
const useTransactionFees = (
  sourceChain: keyof typeof Networks | null,
  token: RosenChainToken | null,
  amount: string | null,
) => {
  const { openSnackbar } = useSnackbar();
  const { height, isLoading: isLoadingHeights } = useChainHeight(sourceChain);
  const hasShownTheNextFeeWarning = useRef<boolean>(false);
  const [minFeeObject, setMinFeeObject] = useState<{
    [chain: string]: BridgeMinimumFee;
  }>({});

  const tokensMap = useTokensMap();

  const getTokenId = useCallback(
    (sourceChain: string, token: RosenChainToken) => {
      const Mapper = new TokenMap(tokensMap);
      const idKey = Mapper.getIdKey(sourceChain);
      const tokens = Mapper.search(sourceChain, {
        [idKey]: token[idKey],
      });
      return tokens[0].ergo.tokenId;
    },
    [tokensMap],
  );

  const { data: fees, isLoading: isLoadingMinFee } = useSWR(
    [
      sourceChain,
      token && sourceChain ? getTokenId(sourceChain, token) : null,
      Number(height),
    ],
    bridgeFetcher(sourceChain ? minFeeObject?.[sourceChain] : null),
    {
      onSuccess: () => {
        hasShownTheNextFeeWarning.current = false;
      },
    },
  );

  const { data: nextFees, isLoading: isLoadingNextFees } = useSWR(
    [
      sourceChain,
      token ? getTokenNameAndId(token, sourceChain!)?.tokenId : null,
      Number(height) + nextFeeHeight,
    ],
    bridgeFetcher(sourceChain ? minFeeObject?.[sourceChain] : null),
    {
      onSuccess: () => {},
    },
  );

  useEffect(() => {
    if (!isLoadingMinFee && !isLoadingNextFees) {
      if (
        fees?.bridgeFee !== nextFees?.bridgeFee ||
        fees?.networkFee !== nextFees?.networkFee
      ) {
        openSnackbar(
          'Fees might change depending on the height of mining the transactions.',
          'warning',
        );
        hasShownTheNextFeeWarning.current = true;
      }
    }
  }, [isLoadingMinFee, isLoadingNextFees, fees, nextFees, openSnackbar]);

  // FIXME: use server actions instead of this
  // local:ergo/rosen-bridge/ui/-/issues/86
  useLayoutEffect(() => {
    const LoadMinFee = async () => {
      if (typeof window === 'object') {
        const BridgeMinimumFee = (
          await import('@rosen-bridge/minimum-fee-browser')
        ).BridgeMinimumFee;

        const cradano = new BridgeMinimumFee(
          cardanoExplorerUrl,
          cardanoFeeConfigTokenId,
        );
        const ergo = new BridgeMinimumFee(
          ergoExplorerUrl,
          ergoFeeConfigTokenId,
        );

        setMinFeeObject({
          [Networks.ergo]: ergo,
          [Networks.cardano]: cradano,
        });
      }
    };
    LoadMinFee();
  }, []);

  const isLoading =
    isLoadingHeights ||
    isLoadingMinFee ||
    isLoadingNextFees ||
    (sourceChain && !minFeeObject?.[sourceChain]);

  // TODO: revalidate the transactions Formula
  // local:ergo/rosen-bridge/ui/-/issues/87
  const transactionFees = useMemo(() => {
    let paymentAmount =
      amount && token
        ? BigInt(getNonDecimalString(amount, token.decimals))
        : BigInt(0);
    const networkFee = fees ? fees.networkFee : null;
    const bridgeFee = fees
      ? bigIntMax(fees.bridgeFee, paymentAmount / feeRatioDivisor)
      : null;

    const receivingAmountValue = fees
      ? paymentAmount - (networkFee! + bridgeFee!)
      : 0n;
    const minTransferAmountValue = fees
      ? bigIntMax(bridgeFee! + networkFee!, networkFee! / feeRatioDivisor || 0n)
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
      receivingAmount: fees
        ? getDecimalString(receivingAmountValue.toString(), token?.decimals)
        : '0',
      minTransferAmount: minTransferAmountValue
        ? getDecimalString(minTransferAmountValue.toString(), token?.decimals)
        : '0',
      isLoading,
    };
  }, [amount, fees, isLoading, token]);

  return transactionFees;
};

export default useTransactionFees;
