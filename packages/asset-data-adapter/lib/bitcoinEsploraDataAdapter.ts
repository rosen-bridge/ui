import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import { ChainAssetBalance } from './types';

export class BitcoinEsploraDataAdapter extends AbstractDataAdapter {
  chain: string = NETWORKS.bitcoin.key;
  protected client: Axios;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    url: string = 'https://blockstream.info',
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
    const response = await this.client.get(`/api/address/${address}`);
    const chainStats = response.data.chain_stats;
    return [
      {
        assetId: NETWORKS.bitcoin.nativeToken,
        balance: BigInt(chainStats.funded_txo_sum - chainStats.spent_txo_sum),
      },
    ];
  };
}
