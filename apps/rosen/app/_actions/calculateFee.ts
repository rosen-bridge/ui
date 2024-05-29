'use server';

import JsonBigInt from '@rosen-bridge/json-bigint';
import { ErgoNetworkType, MinimumFeeBox } from '@rosen-bridge/minimum-fee';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

const cardanoKoiosClient = cardanoKoiosClientFactory(
  process.env.CARDANO_KOIOS_API!,
);
const ergoExplorerClient = ergoExplorerClientFactory(
  process.env.ERGO_EXPLORER_API!,
);

import { ERGO_EXPLORER_URL, Networks, feeConfigTokenId } from '@/_constants';

const GetHeight = {
  cardano: async () => (await cardanoKoiosClient.getTip())[0].block_no,
  ergo: async () =>
    Number((await ergoExplorerClient.v1.getApiV1Networkstate()).height),
  bitcoin: async (): Promise<number> => {
    const response = await fetch(
      `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
    );
    return response.json();
  },
};

/**
 * fetches and return the minimum fee object for a specific token in network
 *
 * @param sourceNetwork
 * @param tokenId
 * @param height
 * @param explorerUrl
 * @param nextHeightInterval
 */

export const calculateFee = async (
  sourceNetwork: keyof typeof Networks,
  targetNetwork: keyof typeof Networks,
  tokenId: string,
  nextHeightInterval: number,
) => {
  const height = await GetHeight[sourceNetwork]();

  if (!height) {
    return {
      tokenId,
      status: 'error',
      message: 'Cannot fetch height from the api endpoint',
    };
  }

  try {
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

    return {
      status: 'success',
      tokenId,
      data: JsonBigInt.stringify({
        fees,
        nextFees,
      }),
    };
  } catch (error) {
    return {
      tokenId,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown Error',
    };
  }
};
