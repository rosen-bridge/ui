import { LockedAssetEntity } from '../../../lib/entities';

export class LockedAssetMockData {
  static SAMPLE_REMOVE_DATA = [
    { tokenId: 'test-token-1', address: 'addr1' },
    { tokenId: 'test-token-2', address: 'addr2' },
  ];

  /**
   * Creates a single LockedAssetEntity with sane defaults.
   * Use the overrides argument to customize any field for a specific test.
   * @param overrides optional fields to override the defaults
   * @returns a LockedAssetEntity instance ready to persist
   */
  static createSingleAsset(
    overrides: Partial<LockedAssetEntity> = {},
  ): LockedAssetEntity {
    const asset = new LockedAssetEntity();
    asset.address = 'addr1';
    asset.tokenId = 'test-token-1';
    asset.amount = BigInt(1000);
    Object.assign(asset, overrides);
    return asset;
  }

  /**
   * Creates multiple LockedAssetEntity instances with incremental data.
   * Addresses and tokenIds are generated deterministically by index.
   * @param count number of entities to generate (default: 2)
   * @param baseOverrides optional fields applied to all generated entities
   * @returns an array of LockedAssetEntity instances
   */
  static createMultipleAssets(
    count: number = 2,
    baseOverrides: Partial<LockedAssetEntity> = {},
  ): LockedAssetEntity[] {
    const assets: LockedAssetEntity[] = [];
    for (let i = 0; i < count; i++) {
      const asset = new LockedAssetEntity();
      asset.address = `addr${i + 1}`;
      asset.tokenId = `test-token-${i + 1}`;
      asset.amount = BigInt((i + 1) * 1000);
      Object.assign(asset, baseOverrides);
      assets.push(asset);
    }
    return assets;
  }
}
