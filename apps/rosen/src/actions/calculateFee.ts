'use server';

import { ErgoNetworkType, MinimumFeeBox } from '@rosen-bridge/minimum-fee';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { EvmChains, getHeight } from '@rosen-network/evm';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Joi from 'joi';

import { wrap } from '@/safeServerAction';

import { FEE_CONFIG_TOKEN_ID } from '../../configs';

const cardanoKoiosClient = cardanoKoiosClientFactory(
  process.env.CARDANO_KOIOS_API!,
);
const ergoExplorerClient = ergoExplorerClientFactory(
  process.env.ERGO_EXPLORER_API!,
);

const GetHeight = {
  [NETWORKS.binance.key]: () => getHeight(EvmChains.BINANCE),
  [NETWORKS.ethereum.key]: () => getHeight(EvmChains.ETHEREUM),
  [NETWORKS.cardano.key]: async () =>
    (await cardanoKoiosClient.tip())[0].block_no,
  [NETWORKS.ergo.key]: async () =>
    Number((await ergoExplorerClient.v1.getApiV1Networkstate()).height),
  [NETWORKS.bitcoin.key]: async (): Promise<number> => {
    const response = await fetch(
      `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
    );
    return response.json();
  },
  [NETWORKS.runes.key]: async (): Promise<number> => {
    const response = await fetch(
      `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
    );
    return response.json();
  },
  [NETWORKS.doge.key]: async (): Promise<number> => {
    const response = await fetch(
      `${process.env.DOGE_BLOCKCYPHER_API}/v1/doge/main`,
    );
    const data = await response.json();
    return data.height;
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

const calculateFeeCore = async (
  sourceNetwork: Network,
  targetNetwork: Network,
  tokenId: string,
  nextHeightInterval: number,
) => {
  const height = await GetHeight[sourceNetwork]();

  if (!height) {
    throw new Error('Cannot fetch height from the api endpoint');
  }

  const minFeeBox = new MinimumFeeBox(
    tokenId,
    FEE_CONFIG_TOKEN_ID,
    ErgoNetworkType.explorer,
    process.env.ERGO_EXPLORER_API!,
  );
  await minFeeBox.fetchBox();

  const [fees, nextFees] = await Promise.all([
    minFeeBox.getFee(sourceNetwork, height, targetNetwork),
    minFeeBox.getFee(sourceNetwork, height + nextHeightInterval, targetNetwork),
  ]);

  return {
    fees,
    nextFees,
  };
};

type Schema = Parameters<typeof calculateFeeCore>;

const schema = Joi.array<Schema>().ordered(
  Joi.string()
    .required()
    .valid(...NETWORKS_KEYS),
  Joi.string()
    .required()
    .valid(...NETWORKS_KEYS),
  Joi.string().required(),
  Joi.number().required(),
);

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'calculateFee',
  schema,
});
