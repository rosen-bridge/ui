import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import * as networks from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

import { FEE_CONFIG_TOKEN_ID } from '../../configs';

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
    const network = Object.values(networks).find(
      (network) => network.name == sourceChain,
    )!;

    const { fees } = await network.calculateFee(
      targetChain,
      ergoTokenId,
      0,
      FEE_CONFIG_TOKEN_ID,
    );

    const networkFee = fees?.networkFee ?? 0n;
    const bridgeFee = fees?.bridgeFee ?? 0n;

    const minTransfer = bridgeFee + networkFee;

    return minTransfer ? minTransfer + 1n : 0n;
  } catch {
    return 0n;
  }
};
