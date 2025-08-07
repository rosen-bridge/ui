import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { calculateFeeCreator } from './calculateFeeCreator';

export const getMinTransferCreator =
  (
    sourceChain: Network,
    calculateFee: ReturnType<typeof calculateFeeCreator>,
  ) =>
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    token: RosenChainToken,
    targetChain: Network,
    minimumFeeNFT: string,
  ): Promise<RosenAmountValue> => {
    const tokenMap = await getTokenMap();

    const tokens = tokenMap.search(sourceChain, {
      tokenId: token.tokenId,
    });

    const ergoTokenId = tokens[0].ergo.tokenId;

    try {
      const { fees } = await calculateFee(
        targetChain,
        ergoTokenId,
        0,
        minimumFeeNFT,
      );

      const networkFee = fees?.networkFee ?? 0n;
      const bridgeFee = fees?.bridgeFee ?? 0n;

      const minTransfer = bridgeFee + networkFee;

      return minTransfer ? minTransfer + 1n : 0n;
    } catch {
      return 0n;
    }
  };
