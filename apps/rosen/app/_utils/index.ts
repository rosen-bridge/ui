import JsonBigInt from '@rosen-bridge/json-bigint';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { TokenInfo } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import { feeAndMinBoxValue as cardanoFeeAndMinBoxValue } from '@/_networks/cardano/transaction/consts';
import ErgoNetwork from '@/_networks/ergo';

import { calculateFee } from '@/_actions/calculateFee';

import { Networks } from '@/_constants';
import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@/_networks/ergo/transaction/consts';

/**
 * a utility to make unique interface for accessing token name
 */
export const getTokenNameAndId = (
  token: RosenChainToken,
  network: keyof typeof Networks,
) => {
  if (network === Networks.ergo) {
    return {
      tokenName: token.name,
      tokenId: token.tokenId,
    };
  } else if (network === Networks.cardano) {
    return {
      tokenName: token.name,
      tokenId: token.fingerprint,
    };
  }
};

/**
 * get max transferable amount of a token
 * @param balance
 * @param chain
 * @param isNative
 */
export const getMaxTransferableAmount = (
  balance: number,
  chain: 'ergo' | 'cardano',
  isNative: boolean,
) => {
  const offsetCandidate = Number(
    chain === 'ergo' ? ergoFee - ergoMinBoxValue : cardanoFeeAndMinBoxValue,
  );
  const shouldApplyOffset = isNative;
  const offset = shouldApplyOffset ? offsetCandidate : 0;
  return balance - offset;
};

/**
 * get max transferable amount of a token
 * @param token
 * @param amount
 * @param sourceChain
 */
export const getMinTransferAmount = async (
  token: TokenInfo,
  sourceChain: 'cardano' | 'ergo',
) => {
  const data = await calculateFee(
    sourceChain,
    token.tokenId,
    ErgoNetwork.api.explorerUrl,
    0,
  );
  const parsedData = {
    ...data,
    data: JsonBigInt.parse(data.data!),
  };
  const { fees } = parsedData.data;

  const networkFee = fees ? Number(fees.networkFee) : 0;
  const bridgeFee = fees ? Number(fees.bridgeFee) : 0;

  const minTransferAmountValue = bridgeFee + networkFee;

  return minTransferAmountValue
    ? getDecimalString(
        (minTransferAmountValue + 1).toString() || '0',
        token?.decimals || 0,
      )
    : '0';
};
