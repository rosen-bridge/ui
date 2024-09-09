import JsonBigInt from '@rosen-bridge/json-bigint';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';

import { getDecimalString } from '@rosen-ui/utils';

import { calculateFee } from '@/_actions/calculateFee';

import { Networks } from '@rosen-ui/constants';
import { AvailableNetworks } from '@/_networks';
import { unwrap } from '@/_errors';
import { RosenAmountValue } from '@rosen-ui/types';
import { fromSafeData } from '@/_utils/safeData';

/**
 * a utility to make unique interface for accessing token name
 */
export const getTokenNameAndId = (
  token: RosenChainToken,
  network: AvailableNetworks,
) => {
  if (
    [
      Networks.ERGO,
      Networks.ETHEREUM,
      Networks.CARDANO,
      Networks.BITCOIN,
    ].includes(network)
  ) {
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
): Promise<RosenAmountValue> => {
  const tokenMap = new TokenMap(tokensMap);
  const idKey = tokenMap.getIdKey(sourceChain);
  const tokens = tokenMap.search(sourceChain, {
    [idKey]: token[idKey],
  });
  const ergoTokenId = tokens[0].ergo.tokenId;

  try {
    const data = await unwrap(fromSafeData(calculateFee))(
      sourceChain,
      targetChain,
      ergoTokenId,
      0,
    );

    const { fees } = JsonBigInt.parse(data);

    const networkFee = fees ? BigInt(fees.networkFee) : 0n;
    const bridgeFee = fees ? BigInt(fees.bridgeFee) : 0n;

    const minTransfer = bridgeFee + networkFee;

    return minTransfer ? minTransfer + 1n : 0n;
  } catch {
    return 0n;
  }
};
