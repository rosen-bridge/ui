import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { describe, it, expect, beforeEach } from 'vitest';

import { LockedAssetsMetricAction } from '../../lib/actions/LockedAssetsMetricAction';
import { createDatabase } from '../utils';

describe('LockedAssetsMetricAction', () => {
  let dataSource: DataSource;
  let action: LockedAssetsMetricAction;
  let lockedAssetRepo: Repository<LockedAssetEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let tokenRepo: Repository<TokenEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new LockedAssetsMetricAction(dataSource);

    lockedAssetRepo = dataSource.getRepository(LockedAssetEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
  });

  /**
   * @target getLockedAssets should fetch all locked assets
   * @dependency database
   * @scenario
   * - insert tokens
   * - insert locked assets referencing those tokens
   * - call getLockedAssets
   * @expected
   * - returns all locked assets in the database
   */
  it('should fetch all locked assets', async () => {
    await tokenRepo.insert([
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo',
        ergoSideTokenId: 'ergo-token-1',
        isResident: false,
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo',
        ergoSideTokenId: 'ergo-token-2',
        isResident: false,
      },
    ]);

    await lockedAssetRepo.insert([
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-2', amount: BigInt(5) },
    ]);

    const lockedAssets = await action.getLockedAssets();
    expect(lockedAssets).toHaveLength(2);
    expect(lockedAssets.map((a) => a.tokenId)).toEqual(
      expect.arrayContaining(['token-1', 'token-2']),
    );
  });

  /**
   * @target getLatestTokenPrices should fetch the latest prices for given token IDs
   * @dependency database
   * @scenario
   * - insert multiple token prices for same token
   * - call getLatestTokenPrices with token IDs
   * @expected
   * - returns prices for all requested token IDs
   * - returns prices ordered by tokenId then timestamp DESC
   */
  it('should fetch latest token prices for given token IDs', async () => {
    await tokenPriceRepo.insert([
      { tokenId: 'token-1', price: 2, timestamp: 1_000 },
      { tokenId: 'token-1', price: 10, timestamp: 2_000 },
      { tokenId: 'token-2', price: 4, timestamp: 1_000 },
    ]);

    const tokenPrices = await action.getLatestTokenPrices([
      'token-1',
      'token-2',
    ]);
    expect(tokenPrices.map((tp) => tp.tokenId)).toEqual(
      expect.arrayContaining(['token-1', 'token-2']),
    );
    expect(tokenPrices[0].timestamp).toBeGreaterThanOrEqual(
      tokenPrices[tokenPrices.length - 1].timestamp,
    );
  });
});
