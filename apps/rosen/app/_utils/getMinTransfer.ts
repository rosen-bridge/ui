import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { calculateFee } from '@/_actions/calculateFee';
import { getTokenMap } from '@/_networks/getTokenMap.client';
import { unwrap } from '@/_safeServerAction';

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
