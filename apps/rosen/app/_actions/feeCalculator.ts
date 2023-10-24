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

export const feeCalculator = async (
  sourceNetwork: keyof typeof Networks,
  tokenId: string,
  height: number,
  explorerUrl: string,
  nextHeightInterval: number,
) => {
  const minimumFee = new BridgeMinimumFee(explorerUrl, feeConfigTokenId);

  const convertedNumber = Number(height);

  try {
    const [fees, nextFees] = await Promise.all([
      minimumFee.getFee(tokenId, sourceNetwork, convertedNumber),
      minimumFee.getFee(
        tokenId,
        sourceNetwork,
        convertedNumber + nextHeightInterval,
      ),
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
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    // we'll proceed, but let's report it
    return {
      tokenId,
      status: 'error',
      message: message,
    };
  }
};
