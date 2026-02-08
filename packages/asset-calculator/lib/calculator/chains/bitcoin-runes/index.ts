import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import axios, { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../../abstract-calculator';
import { AddressRunesBalance, RuneInfo, UnisatResponse } from './types';

export class BitcoinRunesCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS['bitcoin-runes'].key;

  protected client: Axios;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    url: string = 'https://open-api.unisat.io',
    apiKey?: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    // init Unisat client
    const unisatHeaders = { 'Content-Type': 'application/json' };
    if (apiKey) {
      Object.assign(unisatHeaders, {
        Authorization: `Bearer ${apiKey}`,
      });
    }
    this.client = axios.create({
      baseURL: url,
      headers: unisatHeaders,
    });
  }

  /**
   * @param token Runes chain token info
   * @returns total supply of the token
   */
  totalRawSupply = async (token: RosenChainToken): Promise<bigint> => {
    const response = await this.client.get<UnisatResponse<RuneInfo>>(
      `/v1/indexer/runes/${token.tokenId}/info`,
    );
    const tokenDetail = response.data.data;

    if (tokenDetail) {
      this.logger.debug(
        `Total supply of token [${token.tokenId}] is [${tokenDetail.supply}]`,
      );
      return BigInt(tokenDetail.supply);
    }

    throw Error(`Total supply of token [${token.tokenId}] is not calculable`);
  };

  /**
   * @param token Runes chain token info
   * @returns total balance in hot and cold wallets
   */
  totalRawBalance = async (token: RosenChainToken): Promise<bigint> => {
    let tokenBalance = 0n;

    for (const address of this.addresses) {
      const response = await this.client.get<
        UnisatResponse<AddressRunesBalance>
      >(`/v1/indexer/address/${address}/runes/${token.tokenId}/balance`);

      const addressTokenBalance = response.data.data
        ? BigInt(response.data.data.amount)
        : 0n;

      this.logger.debug(
        `Balance of token [${token.name}] in address [${address}] is [${addressTokenBalance}]`,
      );

      tokenBalance += addressTokenBalance;
    }

    this.logger.debug(
      `Total balance of token [${token.name}] is [${tokenBalance}]`,
    );

    return tokenBalance;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    const tokenBalances = await Promise.all(
      this.addresses.map(async (address) => {
        const response = await this.client.get<
          UnisatResponse<AddressRunesBalance>
        >(`/v1/indexer/address/${address}/runes/${token.tokenId}/balance`);

        return response.data.data ? BigInt(response.data.data.amount) : 0n;
      }),
    );

    const balances = zipWith(
      this.addresses,
      tokenBalances,
      (address, amount) => ({
        address,
        amount,
      }),
    ).filter((amountPerAddress) => amountPerAddress.amount);

    for (const { address, amount } of balances) {
      this.logger.debug(
        `balance of token [${token.name}] for address [${address}] is [${amount}]`,
      );
    }

    return balances;
  };
}
