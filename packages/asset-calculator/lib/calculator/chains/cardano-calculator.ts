import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import AbstractCalculator from '../abstract-calculator';

export class CardanoCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.cardano.key;

  private koiosApi;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    authToken?: string,
    logger?: AbstractLogger,
    koiosUrl: string = 'https://api.koios.rest/api/v1',
  ) {
    super(addresses, logger, tokenMap);
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * @param token Cardano chain token info
   * @returns total supply of the token in Cardano
   */
  totalRawSupply = async (token: RosenChainToken): Promise<bigint> => {
    const assetSummary = await this.koiosApi.assetInfo({
      _asset_list: [
        [token.extra.policyId as string, token.extra.assetName as string],
      ],
    });
    if (assetSummary.length && assetSummary[0].total_supply) {
      this.logger.debug(
        `Total supply of token [${token.extra.policyId}.${token.extra.assetName}] is [${assetSummary[0].total_supply}]`,
      );
      return BigInt(assetSummary[0].total_supply);
    }
    throw Error(
      `Total supply of token [${token.extra.policyId}.${token.extra.assetName}] is not calculable`,
    );
  };

  /**
   * @param token Cardano chain token info
   * @returns total balance in hot and cold wallets
   */
  totalRawBalance = async (token: RosenChainToken): Promise<bigint> => {
    const assets = await this.koiosApi.addressAssets({
      _addresses: this.addresses,
    });
    const tokenBalance = assets
      .filter(
        (asset) =>
          asset.policy_id == token.extra.policyId &&
          asset.asset_name == token.extra.assetName &&
          asset.quantity,
      )
      .reduce((sum, asset) => BigInt(asset.quantity!) + sum, 0n);
    this.logger.debug(
      `Total balance of token [${token.extra.policyId}.${token.extra.assetName}] is [${tokenBalance}]`,
    );
    return tokenBalance;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    if (token.type === NATIVE_TOKEN) {
      const addressesInfo = await this.koiosApi.addressInfo({
        _addresses: this.addresses,
      });
      return addressesInfo
        .filter((addressInfo) => addressInfo.address && addressInfo.balance)
        .map((addressInfo) => ({
          address: addressInfo.address!,
          amount: BigInt(addressInfo.balance!),
        }));
    }

    const assets = await this.koiosApi.addressAssets({
      _addresses: this.addresses,
    });

    return assets
      .filter(
        (asset) =>
          asset.policy_id == token.extra.policyId &&
          asset.asset_name == token.extra.assetName &&
          asset.quantity &&
          asset.address,
      )
      .map((asset) => ({
        address: asset.address!,
        amount: BigInt(asset.quantity!),
      }));
  };
}
