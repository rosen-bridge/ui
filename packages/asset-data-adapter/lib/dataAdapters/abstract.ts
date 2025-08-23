import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';

import { AssetBalance, ChainAssetBalance } from '../interfaces';

export abstract class AbstractDataAdapter {
  abstract chain: string;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected readonly logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Aggregates balances of all tracked addresses into a list of assets.
   *
   * @returns {AssetBalance[]} list of assets with address-specific balances
   */
  public fetch = (): AssetBalance => {
    const chainAssets: AssetBalance = {};
    for (const address of this.addresses) {
      const assets = this.getAddressAssets(address);
      for (const asset of assets) {
        if (this.tokenMap.getTokenSet(asset.assetId) != undefined) {
          chainAssets[asset.assetId] = chainAssets[asset.assetId] ?? [];
          chainAssets[asset.assetId].push({
            address: address,
            balance: this.tokenMap.wrapAmount(
              asset.assetId,
              asset.balance,
              this.chain,
            ).amount,
          });
        }
      }
    }
    return chainAssets;
  };

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {ChainAssetBalance[]} list of asset balances for the address
   */
  abstract getAddressAssets: (address: string) => ChainAssetBalance[];
}
