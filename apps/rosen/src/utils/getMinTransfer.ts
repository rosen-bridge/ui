import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { calculateFee } from '@/actions';
import { unwrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

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
  const tokens = tokenMap.search(sourceChain, {
    tokenId: token.tokenId,
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
