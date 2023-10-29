'use server';

import { BridgeMinimumFee } from '@rosen-bridge/minimum-fee';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { Networks, feeConfigTokenId } from '@/_constants';

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
  height: number,
  explorerUrl: string,
  nextHeightInterval: number,
) => {
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
