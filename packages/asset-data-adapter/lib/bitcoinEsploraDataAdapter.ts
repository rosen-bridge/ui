import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import {
  BitcoinEsploraDataAdapterAuthParams,
  ChainAssetBalance,
} from './types';

export class BitcoinEsploraDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS.bitcoin.key;
  protected client: Axios;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected authParams: BitcoinEsploraDataAdapterAuthParams,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.client = new Axios({
      baseURL: authParams.url ?? 'https://blockstream.info',
    });
  }

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const response = await this.client.get(`/api/address/${address}`);
    const chainStats = response.data.chain_stats;
    return [
      {
        assetId: NETWORKS.bitcoin.nativeToken,
        balance: BigInt(chainStats.funded_txo_sum - chainStats.spent_txo_sum),
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
