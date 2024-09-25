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
import { ERGO_EXPLORER_URL, feeConfigTokenId } from '@/_constants';
import { Network } from '@rosen-ui/types';
import { wrap } from '@/_errors';
import { toSafeData } from '@/_utils/safeData';

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

export const calculateFee = wrap(
  toSafeData(
    async (
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
          feeConfigTokenId,
          ErgoNetworkType.explorer,
          ERGO_EXPLORER_URL,
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
        throw new Error(
          error instanceof Error ? error.message : 'Unknown Error',
        );
      }
    },
  ),
);
