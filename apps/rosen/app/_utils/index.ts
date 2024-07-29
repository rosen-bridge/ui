import JsonBigInt from '@rosen-bridge/json-bigint';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';

import { getDecimalString } from '@rosen-ui/utils';

import { calculateFee } from '@/_actions/calculateFee';

import { Networks } from '@rosen-ui/constants';
import { AvailableNetworks } from '@/_networks';
import { unwrap } from '@/_errors';

/**
 * a utility to make unique interface for accessing token name
 */
export const getTokenNameAndId = (
  token: RosenChainToken,
  network: AvailableNetworks,
) => {
  if ([Networks.ERGO, Networks.CARDANO, Networks.BITCOIN].includes(network)) {
    return {
      tokenName: token.name,
      tokenId: token.tokenId,
    };
  }
};

/**
 * get min transfer amount of a token
 * @param token
 * @param amount
 * @param sourceChain
 * @returns A WRAPPED-VALUE
 */
export const getMinTransfer = async (
  token: RosenChainToken,
  sourceChain: AvailableNetworks,
  targetChain: AvailableNetworks,
  tokensMap: any,
) => {
  const tokenMap = new TokenMap(tokensMap);
  const idKey = tokenMap.getIdKey(sourceChain);
  const tokens = tokenMap.search(sourceChain, {
    [idKey]: token[idKey],
  });
  const ergoTokenId = tokens[0].ergo.tokenId;

  try {
    const data = await unwrap(calculateFee)(
      sourceChain,
      targetChain,
      ergoTokenId,
      0,
    );

    const { fees } = JsonBigInt.parse(data);

    const networkFee = fees ? Number(fees.networkFee) : 0;
    const bridgeFee = fees ? Number(fees.bridgeFee) : 0;

    const minTransfer = bridgeFee + networkFee;

    const decimals = tokenMap.getSignificantDecimals(token.tokenId);

    return minTransfer
      ? getDecimalString((minTransfer + 1).toString() || '0', decimals || 0)
      : '0';
  } catch {
    return '0';
  }
};
