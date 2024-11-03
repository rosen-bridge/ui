import { RosenChainToken } from '@rosen-bridge/tokens';

import { calculateFee } from '@/_actions/calculateFee';

import { NETWORK_VALUES } from '@rosen-ui/constants';
import { unwrap } from '@/_safeServerAction';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { getTokenMap } from '@/_networks/getTokenMap.client';

/**
 * a utility to make unique interface for accessing token name
 */
export const getTokenNameAndId = (token: RosenChainToken, network: Network) => {
  if (NETWORK_VALUES.includes(network)) {
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
  sourceChain: Network,
  targetChain: Network,
): Promise<RosenAmountValue> => {
  const tokenMap = await getTokenMap();
  const idKey = tokenMap.getIdKey(sourceChain);
  const tokens = tokenMap.search(sourceChain, {
    [idKey]: token[idKey],
  });
  const ergoTokenId = tokens[0].ergo.tokenId;

  try {
    const { fees } = await unwrap(calculateFee)(
      sourceChain,
      targetChain,
      ergoTokenId,
      0,
    );

    const networkFee = fees?.networkFee ?? 0n;
    const bridgeFee = fees?.bridgeFee ?? 0n;

    const minTransfer = bridgeFee + networkFee;

    return minTransfer ? minTransfer + 1n : 0n;
  } catch {
    return 0n;
  }
};
