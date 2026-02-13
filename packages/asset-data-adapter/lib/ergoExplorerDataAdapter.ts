import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import { ChainAssetBalance, ErgoExplorerDataAdapterAuthParams } from './types';

export class ErgoExplorerDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS.ergo.key;
  protected explorerApi;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected authParams: ErgoExplorerDataAdapterAuthParams,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);

    this.explorerApi = ergoExplorerClientFactory(authParams.explorerUrl);
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

  /**
   * Returns the raw total supply of a wrapped token on the current chain.
   *
   * @param wrappedTokenId - Identifier of the wrapped token.
   * @returns The raw total supply as a bigint (not normalized).
   */
  getRawTotalSupply = async (token: RosenChainToken) => {
    const tokenDetail = await this.explorerApi.v1.getApiV1TokensP1(
      token.tokenId,
    );
    if (tokenDetail) {
      this.logger.debug(
        `Total supply of token [${token.tokenId}] is [${tokenDetail.emissionAmount}]`,
      );
      return tokenDetail.emissionAmount;
    }
    throw Error(`Total supply of token [${token.tokenId}] is not calculable`);
  };
}
