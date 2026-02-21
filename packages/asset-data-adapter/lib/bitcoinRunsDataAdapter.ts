import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import {
  AddressRunesBalance,
  ChainAssetBalance,
  RuneInfo,
  UnisatResponse,
} from './types';

export class BitcoinRunesDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS['bitcoin-runes'].key;

  protected client: Axios;

  constructor(
    addresses: string[],
    tokenMap: TokenMap,
    url: string = 'https://open-api.unisat.io',
    apiKey?: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    this.client = new Axios({
      baseURL: url,
      headers: headers,
    });
  }

  /**
   * Fetch all rune balances for an address
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    this.logger.info(
      `Collecting rune balances from ${this.chain} for address ${address} started.`,
    );

    const balances: ChainAssetBalance[] = [];

    const tokens = this.tokenMap.getTokens(this.chain, this.chain);
    for (const token of tokens) {
      const response = await this.client.get<
        UnisatResponse<AddressRunesBalance>
      >(`/v1/indexer/address/${address}/runes/${token.tokenId}/balance`);
      const amount = response.data.data
        ? BigInt(response.data.data.amount)
        : 0n;

      balances.push({
        assetId: token.tokenId,
        balance: amount,
      });

      this.logger.debug(
        `Balance of token [${token.name}] in address [${address}] is [${amount}]`,
      );
    }

    this.logger.info(
      `Collecting rune balances from ${this.chain} for address ${address} done.`,
    );

    return balances;
  };

  /**
   * Fetch total supply for a rune
   *
   * @param wrappedTokenId - Identifier of the wrapped token.
   * @returns The raw total supply as a bigint (not normalized).
   */
  getRawTotalSupply = async (token: RosenChainToken): Promise<bigint> => {
    const response = await this.client.get<UnisatResponse<RuneInfo>>(
      `/v1/indexer/runes/${token.tokenId}/info`,
    );

    const tokenDetail = response.data.data;

    if (!tokenDetail)
      throw Error(`Total supply of token [${token.tokenId}] is not available`);

    return BigInt(tokenDetail.supply);
  };
}
