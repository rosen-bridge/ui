import { Network } from '@rosen-ui/types';

import { BridgedAssetEntity, TokenEntity } from '../../../lib/entities';

export class BridgedAssetMockData {
  /**
   * Sample data for testing remove operations
   */
  static SAMPLE_REMOVE_DATA = [
    { tokenId: 'test-token-1', chain: 'ergo' as Network },
    { tokenId: 'test-token-2', chain: 'ethereum' as Network },
  ];

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
      chain: 'ethereum',
    },
    {
      id: 'test-token-3',
      name: 'Test Token 3',
      decimal: 18,
      significantDecimal: 18,
      isNative: false,
      chain: 'bitcoin',
    },
  ];
  /**
   * Creates a single bridged asset entity for testing
   * @param overrides - Optional properties to override default values
   * @returns BridgedAssetEntity instance
   */
  static createSingleAsset(
    overrides: Partial<BridgedAssetEntity> = {},
  ): BridgedAssetEntity {
    const asset = new BridgedAssetEntity();
    asset.chain = 'ergo';
    asset.tokenId = 'test-token-1';
    asset.amount = BigInt(1000);
    asset.bridgedTokenId = 'bridged-token-1';

    // Apply overrides
    Object.assign(asset, overrides);

    return asset;
  }

  /**
   * Creates multiple bridged asset entities for testing
   * @param count - Number of assets to create
   * @param baseOverrides - Base overrides to apply to all assets
   * @returns Array of BridgedAssetEntity instances
   */
  static createMultipleAssets(
    count: number = 2,
    baseOverrides: Partial<BridgedAssetEntity> = {},
  ): BridgedAssetEntity[] {
    const assets: BridgedAssetEntity[] = [];

    for (let i = 0; i < count; i++) {
      const asset = new BridgedAssetEntity();
      asset.chain = i % 2 === 0 ? 'ergo' : 'ethereum';
      asset.tokenId = `test-token-${i + 1}`;
      asset.amount = BigInt((i + 1) * 1000);
      asset.bridgedTokenId = `bridged-token-${i + 1}`;

      // Apply base overrides
      Object.assign(asset, baseOverrides);

      assets.push(asset);
    }

    return assets;
  }

  /**
   * Creates test data for different networks
   * @returns Array of BridgedAssetEntity instances for different networks
   */
  static createNetworkTestData(): BridgedAssetEntity[] {
    const networks: Network[] = ['ergo', 'ethereum', 'bitcoin'];

    return networks.map((network, index) => {
      const asset = new BridgedAssetEntity();
      asset.chain = network;
      asset.tokenId = `test-token-${network}`;
      asset.amount = BigInt((index + 1) * 1000);
      asset.bridgedTokenId = `bridged-token-${network}`;
      return asset;
    });
  }

  /**
   * Generate BridgedAssetEntity data
   *
   * @param token
   * @param amount
   * @param tokenId
   * @param address
   *
   * @returns Not saved LockedTokenEntities
   */
  static generateMockedBridgedEntity = (
    tokens: TokenEntity[],
    amount: bigint = 1000n,
  ) => {
    const lockedTokens = [];
    for (const token of tokens)
      lockedTokens.push({
        token: token,
        amount: amount,
        chain: 'ergo' as const,
        address: crypto.randomUUID(),
        bridgedTokenId: 'erg',
      });
    return lockedTokens;
  };
}
