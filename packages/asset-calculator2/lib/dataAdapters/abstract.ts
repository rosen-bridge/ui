import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';

import { AssetBalance, AddressBalance, ChainAssetBalance } from '../interfaces';

export abstract class AbstractDataAdapter {
  abstract chain: string;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected readonly logger: AbstractLogger = new DummyLogger(),
  ) {}

  public fetch = (): AssetBalance[] => {
    const chainAssets: { [assetId: string]: AddressBalance[] } = {};
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
    return Object.entries(chainAssets).map(([assetId, addressBalance]) => ({
      assetId: assetId,
      addressBalance: addressBalance,
    }));
  };

  abstract getAddressAssets: (address: string) => ChainAssetBalance[];
}
