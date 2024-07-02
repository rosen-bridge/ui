import JsonBigInt from '@rosen-bridge/json-bigint';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';

import { getDecimalString } from '@rosen-ui/utils';

import { calculateFee } from '@/_actions/calculateFee';

import { Networks } from '@rosen-ui/constants';
import { AvailableNetworks } from '@/_networks';

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

  const data = await calculateFee(sourceChain, targetChain, ergoTokenId, 0);
  const parsedData = {
    ...data,
    data: JsonBigInt.parse(data.data!),
  };
  const { fees } = parsedData.data;

  const networkFee = fees ? Number(fees.networkFee) : 0;
  const bridgeFee = fees ? Number(fees.bridgeFee) : 0;

  const minTransfer = bridgeFee + networkFee;

  return minTransfer
    ? getDecimalString(
        (minTransfer + 1).toString() || '0',
        token?.decimals || 0,
      )
    : '0';
};
