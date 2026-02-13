import { LockedAssetEntity, TokenEntity } from '../../lib/entities';

export class LockedAssetTestData {
  /**
   * Sample token entities required for foreign key constraints
   */
  static SAMPLE_TOKENS: Partial<TokenEntity>[] = [
    {
      id: 'test-token-1',
      name: 'Test Token 1',
      decimal: 18,
      significantDecimal: 18,
      isNative: false,
      chain: 'ergo',
    },
    {
      id: 'test-token-2',
      name: 'Test Token 2',
      decimal: 18,
      significantDecimal: 18,
      isNative: false,
      chain: 'ergo',
    },
    {
      id: 'test-token-3',
      name: 'Test Token 3',
      decimal: 18,
      significantDecimal: 18,
      isNative: false,
      chain: 'ergo',
    },
  ];

  /**
   * Generate LockedAssetEntity data
   *
   * @param token
   * @param amount
   * @param tokenId
   * @param address
   *
   * @returns Not saved LockedTokenEntities
   */
  static generateTestDataLockedEntity = (
    tokens: TokenEntity[],
    amount: bigint = 1000n,
  ) => {
    const lockedTokens = [];
    for (const token of tokens)
      lockedTokens.push({
        token: token,
        amount: amount,
        address: crypto.randomUUID(),
      });
    return lockedTokens;
  };

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
