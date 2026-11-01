import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import type { ChainAssetBalance } from './types';

export class FiroExplorerDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS.firo.key;
  protected client: Axios;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected url: string = 'https://explorer.firo.org',
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);

    this.client = new Axios({
      baseURL: url,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {ChainAssetBalance[]} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const response = await this.client.get<number | string>(
      `/insight-api-zcoin/addr/${address}/balance`,
    );
    return [
      {
        assetId: NETWORKS.firo.nativeToken,
        balance: BigInt(response.data),
      },
    ];
  };

  /**
   * Returns the raw total supply of a wrapped token on the current chain.
   *
   * @param wrappedTokenId - Identifier of the wrapped token.
   * @returns The raw total supply as a bigint (not normalized).
   */
  getRawTotalSupply = async () => 0n;
}
