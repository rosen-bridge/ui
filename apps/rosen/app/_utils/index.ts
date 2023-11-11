import { RosenChainToken } from '@rosen-bridge/tokens';

import { Networks } from '@/_constants';
import { feeAndMinBoxValue as cardanoFeeAndMinBoxValue } from '@/_networks/cardano/transaction/consts';
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
