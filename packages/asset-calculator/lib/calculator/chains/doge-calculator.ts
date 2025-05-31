import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import axios, { Axios } from '@rosen-bridge/rate-limited-axios';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../abstract-calculator';

export class DogeCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.doge.key;

  protected client: Axios;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    blockcypherUrl: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.client = axios.create({
      baseURL: blockcypherUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /*
   * @param token Doge chain token supply, always 0
   */
  totalRawSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /*
   * @param token Doge chain token balance, always 0
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
          const response = await this.client.get<{ final_balance: number }>(
            `v1/doge/main/addrs/${address}`,
          );
          return BigInt(response.data.final_balance);
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
