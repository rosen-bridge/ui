import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import AbstractCalculator from '../abstract-calculator';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

export class CardanoCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.CARDANO;

  private koiosApi;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    authToken?: string,
    logger?: AbstractLogger,
    koiosUrl: string = 'https://api.koios.rest/api/v1'
  ) {
    super(addresses, logger, tokenMap);
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * @param token Cardano chain token info
   * @returns total supply of the token in Cardano
   */
  totalRawSupply = async (token: RosenChainToken): Promise<bigint> => {
    const assetSummary = await this.koiosApi.postAssetInfo({
      _asset_list: [[token.policyId, token.assetName]],
    });
    if (assetSummary.length && assetSummary[0].total_supply) {
      this.logger.debug(
        `Total supply of token [${token.policyId}.${token.assetName}] is [${assetSummary[0].total_supply}]`
      );
      return BigInt(assetSummary[0].total_supply);
    }
    throw Error(
      `Total supply of token [${token.policyId}.${token.assetName}] is not calculable`
    );
  };

  /**
   * @param token Cardano chain token info
   * @returns total balance in hot and cold wallets
   */
  totalRawBalance = async (token: RosenChainToken): Promise<bigint> => {
    const assets = await this.koiosApi.postAddressAssets({
      _addresses: this.addresses,
    });
    const tokenBalance = assets
      .filter(
        (asset) =>
          asset.policy_id == token.policyId &&
          asset.asset_name == token.assetName &&
          asset.quantity
      )
      .reduce((sum, asset) => BigInt(asset.quantity!) + sum, 0n);
    this.logger.debug(
      `Total balance of token [${token.policyId}.${token.assetName}] is [${tokenBalance}]`
    );
    return tokenBalance;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    if (token.metaData.type === NATIVE_TOKEN) {
      const addressesInfo = await this.koiosApi.postAddressInfo({
        _addresses: this.addresses,
      });
      return addressesInfo
        .filter((addressInfo) => addressInfo.address && addressInfo.balance)
        .map((addressInfo) => ({
          address: addressInfo.address!,
          amount: BigInt(addressInfo.balance!),
        }));
    }

    const assets = await this.koiosApi.postAddressAssets({
      _addresses: this.addresses,
    });

    return assets
      .filter(
        (asset) =>
          asset.policy_id == token.policyId &&
          asset.asset_name == token.assetName &&
          asset.quantity &&
          asset.address
      )
      .map((asset) => ({
        address: asset.address!,
        amount: BigInt(asset.quantity!),
      }));
  };
}
