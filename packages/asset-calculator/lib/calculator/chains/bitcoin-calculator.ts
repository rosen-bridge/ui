import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import axios, { AxiosInstance } from 'axios';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../abstract-calculator';

/**
 * This type only contains the part of the type that is required here
 */
interface PartialEsploraAddress {
  chain_stats: {
    funded_txo_sum: number;
    spent_txo_sum: number;
  };
}

export class BitcoinCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.BITCOIN;

  protected client: AxiosInstance;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    url: string = 'https://blockstream.info',
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.client = axios.create({
      baseURL: url,
    });
  }

  /**
   * @param token Bitcoin chain token supply, always 0
   */
  totalRawSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * @param token Bitcoin chain token balance, always 0
   */
  totalRawBalance = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    if (token.metaData.type === NATIVE_TOKEN) {
      const balances = await Promise.all(
        this.addresses.map(async (address) => {
          const response = await this.client.get<PartialEsploraAddress>(
            `/api/address/${address}`,
          );
          const chainStats = response.data.chain_stats;
          return BigInt(chainStats.funded_txo_sum - chainStats.spent_txo_sum);
        }),
      );
      return zipWith(this.addresses, balances, (address, amount) => ({
        address,
        amount,
      })).filter((amountPerAddress) => amountPerAddress.amount);
    }

    return [];
  };
}
