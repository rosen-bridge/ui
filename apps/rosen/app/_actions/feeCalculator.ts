'use server';

import { BridgeMinimumFee } from '@rosen-bridge/minimum-fee';
import JsonBigInt from '@rosen-bridge/json-bigint';

import ErgoNetwork from '@/_networks/ergo';
import CardanoNetwork from '@/_networks/cardano';

import {
  Networks,
  ergoFeeConfigTokenId,
  cardanoFeeConfigTokenId,
} from '@/_constants';

const cardano = new BridgeMinimumFee(
  ErgoNetwork.api.explorerUrl,
  cardanoFeeConfigTokenId,
);

const ergo = new BridgeMinimumFee(
  ErgoNetwork.api.explorerUrl,
  ergoFeeConfigTokenId,
);

const feeObjects = {
  [Networks.ergo]: ergo,
  [Networks.cardano]: cardano,
};

const networkObjects = {
  [Networks.ergo]: ErgoNetwork,
  [Networks.cardano]: CardanoNetwork,
};

/**
 * fetches and return the minimum fee object for a specific token in network
 *
 * @param sourceNetwork : the current selected network
 * @param tokenId: current selected tokenId
 * @param height: current chain height
 */

export const feeCalculator = async (
  sourceNetwork: keyof typeof Networks,
  tokenId: string,
  height: bigint,
) => {
  const chainFeeObject = feeObjects[sourceNetwork];
  const networkObject = networkObjects[sourceNetwork];
  const convertedNumber = Number(height);

  try {
    const [fees, nextFees] = await Promise.all([
      chainFeeObject.getFee(tokenId, sourceNetwork, convertedNumber),
      chainFeeObject.getFee(
        tokenId,
        sourceNetwork,
        convertedNumber + networkObject.nextHeightInterval,
      ),
    ]);

    chainFeeObject.feeRatioDivisor;
    return {
      status: 'success',
      tokenId,
      feeRatioDivisor: chainFeeObject.feeRatioDivisor,
      data: JsonBigInt.stringify({
        fees,
        nextFees,
      }),
    };
  } catch {
    return {
      tokenId,
      status: 'error',
    };
  }
};
