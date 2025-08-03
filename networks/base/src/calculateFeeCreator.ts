import { ErgoNetworkType, MinimumFeeBox } from '@rosen-bridge/minimum-fee';
import { Network } from '@rosen-ui/types';

export const calculateFeeCreator = (
  sourceNetwork: Network,
  getHeight: () => Promise<number>,
) => {
  return async (
    targetNetwork: Network,
    tokenId: string,
    nextHeightInterval: number,
    minimumFeeNFT: string,
  ) => {
    const height = await getHeight();

    if (!height) {
      throw new Error('Cannot fetch height from the api endpoint');
    }

    const minFeeBox = new MinimumFeeBox(
      tokenId,
      minimumFeeNFT,
      ErgoNetworkType.explorer,
      process.env.ERGO_EXPLORER_API!,
    );

    await minFeeBox.fetchBox();

    const [fees, nextFees] = await Promise.all([
      minFeeBox.getFee(sourceNetwork, height, targetNetwork),
      minFeeBox.getFee(
        sourceNetwork,
        height + nextHeightInterval,
        targetNetwork,
      ),
    ]);

    return {
      fees,
      nextFees,
    };
  };
};
