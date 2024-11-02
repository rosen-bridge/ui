'use server';

import JsonBigInt from '@rosen-bridge/json-bigint';
import { ErgoNetworkType, MinimumFeeBox } from '@rosen-bridge/minimum-fee';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { getHeight as ethereumGetHeight } from '@rosen-network/ethereum';

const cardanoKoiosClient = cardanoKoiosClientFactory(
  process.env.CARDANO_KOIOS_API!,
);
const ergoExplorerClient = ergoExplorerClientFactory(
  process.env.ERGO_EXPLORER_API!,
);

import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { wrap } from '@/_safeServerAction';

const GetHeight = {
  [NETWORKS.ETHEREUM]: ethereumGetHeight,
  [NETWORKS.CARDANO]: async () =>
    (await cardanoKoiosClient.getTip())[0].block_no,
  [NETWORKS.ERGO]: async () =>
    Number((await ergoExplorerClient.v1.getApiV1Networkstate()).height),
  [NETWORKS.BITCOIN]: async (): Promise<number> => {
    const response = await fetch(
      `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
    );
    return response.json();
  },
} as const;

/**
 * fetches and return the minimum fee object for a specific token in network
 *
 * @param sourceNetwork
 * @param tokenId
 * @param height
 * @param explorerUrl
 * @param nextHeightInterval
 * @returns CONTAINS WRAPPED-VALUE
 */

export const calculateFeeCore = async (
  sourceNetwork: Network,
  targetNetwork: Network,
  tokenId: string,
  nextHeightInterval: number,
) => {
  try {
    const height = await GetHeight[sourceNetwork]();

    if (!height) {
      throw new Error('Cannot fetch height from the api endpoint');
    }

    const minFeeBox = new MinimumFeeBox(
      tokenId,
      process.env.NEXT_PUBLIC_FEE_CONFIG_TOKEN_ID!,
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

    return JsonBigInt.stringify({
      fees,
      nextFees,
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown Error');
  }
};

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'calculateFee',
});
