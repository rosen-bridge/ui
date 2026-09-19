import { zipWith } from 'lodash-es';

import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, type RosenChainToken, type TokenMap } from '@rosen-bridge/tokens';
import axios, { type Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

import AbstractCalculator from '../abstract-calculator';

const NONE_COVENANT_TYPE = 0;

/**
 * This type only contains the part of the type that is required here
 */
interface PartialHandshakeCoin {
  value: number;
  covenant: {
    type: number;
  };
}

export class HandshakeCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.handshake.key;

  protected client: Axios;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    url: string = 'https://hsd.ergexplorer.com',
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.client = axios.create({
      baseURL: url,
    });
  }

  /**
   * @param token Handshake chain token supply, always 0
   */
  totalRawSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * @param token Handshake chain token balance, always 0
   */
  totalRawBalance = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    if (token.type === NATIVE_TOKEN) {
      const balances = await Promise.all(
        this.addresses.map(async (address) => {
          const response = await this.client.get<PartialHandshakeCoin[]>(
            `/coin/address/${address}`,
          );
          // name related covenants lock their value, so only plain coins are counted
          return response.data
            .filter((coin) => coin.covenant.type === NONE_COVENANT_TYPE)
            .reduce((sum, coin) => sum + BigInt(coin.value), 0n);
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
