import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import {
  ChainAssetBalance,
  DogeBlockCypherDataAdapterAuthParams,
} from './types';

export class DogeBlockCypherDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS.doge.key;
  protected client: Axios;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected authParams: DogeBlockCypherDataAdapterAuthParams,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);

    this.client = new Axios({
      baseURL: authParams.blockCypherUrl,
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
    const response = await this.client.get<{ final_balance: number }>(
      `v1/doge/main/addrs/${address}`,
    );
    return [
      {
        assetId: NETWORKS.doge.nativeToken,
        balance: BigInt(response.data.final_balance),
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
