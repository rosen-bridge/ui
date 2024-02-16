'use server';

import JsonBigInt from '@rosen-bridge/json-bigint';
import { BridgeMinimumFee } from '@rosen-bridge/minimum-fee';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

const cardanoKoiosClient = cardanoKoiosClientFactory(
  process.env.CARDANO_KOIOS_API!,
);
const ergoExplorerClient = ergoExplorerClientFactory(
  process.env.ERGO_EXPLORER_API!,
);

import { Networks, feeConfigTokenId } from '@/_constants';

const GetHeight = {
  cardano: async () => (await cardanoKoiosClient.getTip())[0].block_no,
  ergo: async () =>
    Number((await ergoExplorerClient.v1.getApiV1Networkstate()).height),
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
  tokenId: string,
  explorerUrl: string,
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

  const minimumFee = new BridgeMinimumFee(explorerUrl, feeConfigTokenId);

  try {
    const [fees, nextFees] = await Promise.all([
      minimumFee.getFee(tokenId, sourceNetwork, height),
      minimumFee.getFee(tokenId, sourceNetwork, height + nextHeightInterval),
    ]);

    return {
      status: 'success',
      tokenId,
      feeRatioDivisor: minimumFee.feeRatioDivisor,
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
