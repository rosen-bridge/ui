import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { CARDANO_NATIVE_ASSET_KEY, NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import { ChainAssetBalance } from './types';

export class CardanoKoiosDataAdapter extends AbstractDataAdapter {
  chain: string = NETWORKS.cardano.key;
  protected koiosApi;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected koiosUrl: string = 'https://api.koios.rest/api/v1',
    protected authToken?: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * Fetch and return Cardano native-token(ada) amount
   *
   * @param {string} address
   * @returns {Promise<ChainAssetBalance>}
   */
  protected getNativeAssetBalance = async (address: string) => {
    const addressesInfo = await this.koiosApi.addressInfo({
      _addresses: [address],
    });
    const accountNativeBalance = addressesInfo[0].balance;
    if (accountNativeBalance == undefined)
      throw new Error(`Balance of "${address}" Cardano address is undefined.`);
    return {
      assetId: CARDANO_NATIVE_ASSET_KEY,
      balance: BigInt(accountNativeBalance),
    };
  };

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    this.logger.info(
      `Collecting assets data from ${this.chain} and ${address} address started.`,
    );
    const assetBalances: ChainAssetBalance[] = [];
    const nativeBalance = await this.getNativeAssetBalance(address);
    if (nativeBalance) assetBalances.push(nativeBalance);

    const assets = await this.koiosApi.addressAssets({ _addresses: [address] });
    assets.forEach((asset) => {
      const identity = `${asset.policy_id}.${asset.asset_name}`;
      if (asset.quantity == undefined)
        throw new Error(
          `Amount of a asset on the "${address}" address of Cardano chain by "${identity}" identity is invalid`,
        );
      assetBalances.push({
        assetId: identity,
        balance: BigInt(asset.quantity),
      });
    });
    this.logger.info(
      `Collecting assets data from ${this.chain} and ${address} address done.`,
    );
    return assetBalances;
  };
}
