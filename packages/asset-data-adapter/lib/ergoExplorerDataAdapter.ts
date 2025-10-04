import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import { ChainAssetBalance } from './types';

export class ErgoExplorerDataAdapter extends AbstractDataAdapter {
  chain: string = NETWORKS.ergo.key;
  protected explorerApi;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected explorerUrl: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const apiResult =
      await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(address);
    const assets: ChainAssetBalance[] = [];
    assets.push({
      assetId: NETWORKS.ergo.nativeToken,
      balance: apiResult.nanoErgs,
    });
    apiResult.tokens?.forEach((asset) =>
      assets.push({
        assetId: asset.tokenId,
        balance: asset.amount,
      }),
    );
    return assets;
  };
}
