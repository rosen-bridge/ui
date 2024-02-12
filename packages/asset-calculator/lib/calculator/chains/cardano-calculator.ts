import { RosenChainToken } from '@rosen-bridge/tokens';
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import AbstractCalculator from '../abstract-calculator';

export class CardanoCalculator extends AbstractCalculator {
  private koiosApi;

  constructor(
    addresses: string[],
    koiosUrl: string,
    authToken?: string,
    logger = new DummyLogger()
  ) {
    super(addresses, logger);
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * @param token Cardano chain token info
   * @returns total supply of the token in Cardano
   */
  totalSupply = async (token: RosenChainToken): Promise<bigint> => {
    const assetSummary = await this.koiosApi.postAssetInfo({
      _asset_list: [token.policyId, token.name],
    });
    if (assetSummary.length && assetSummary[0].total_supply) {
      this.logger.debug(
        `Total supply of token [${token}] is [${assetSummary[0].total_supply}]`
      );
      return BigInt(assetSummary[0].total_supply);
    }
    throw Error('Total supply is not calculable');
  };

  /**
   * @param token Cardano chain token info
   * @returns total balance in hot and cold wallets
   */
  totalBalance = async (token: RosenChainToken): Promise<bigint> => {
    const assets = await this.koiosApi.postAddressAssets({
      _addresses: this.addresses,
    });
    const tokenBalance = assets
      .filter(
        (asset) =>
          asset.policy_id == token.policyId &&
          asset.asset_name == token.name &&
          asset.quantity
      )
      .reduce((sum, asset) => BigInt(asset.quantity!) + sum, 0n);
    this.logger.debug(`Total balance of token [${token}] is [${tokenBalance}]`);
    return tokenBalance;
  };
}
