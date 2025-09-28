import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import { ChainAssetBalance } from './types';

export class DogeBlockCypherDataAdapter extends AbstractDataAdapter {
  chain: string = NETWORKS.doge.key;
  protected client: Axios;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected authParams: { [key: string]: string },
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);

    if (Object.keys(authParams).indexOf('blockCypherUrl') < 0)
      throw new Error(
        'The DogeBlockCypherDataAdapter required blockCypherUrl param not provided.',
      );
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
}
