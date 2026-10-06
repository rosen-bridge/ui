import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import { NONE_COVENANT_TYPE } from './constants';
import type { ChainAssetBalance, PartialHandshakeCoin } from './types';

export class HandshakeExplorerDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS.handshake.key;
  protected client: Axios;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected url: string = 'https://hsd.ergexplorer.com',
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.client = new Axios({
      baseURL: url,
    });
  }

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const response = await this.client.get<PartialHandshakeCoin[]>(`/coin/address/${address}`);

    // name related covenants lock their value, so only plain coins are counted
    const balance = response.data
      .filter((coin) => coin.covenant.type === NONE_COVENANT_TYPE)
      .reduce((sum, coin) => sum + BigInt(coin.value), 0n);

    return [
      {
        assetId: NETWORKS.handshake.nativeToken,
        balance,
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
