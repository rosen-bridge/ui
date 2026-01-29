import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { METRIC_KEYS, MetricEntity } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { lockedAssetsMetric } from '../../lib/jobs';
import { createDatabase } from '../utils';

describe('lockedAssetsMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let lockedAssetRepo: Repository<LockedAssetEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let logger: DummyLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    lockedAssetRepo = dataSource.getRepository(LockedAssetEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
    logger = new DummyLogger();
    await metricRepo.clear();
    await lockedAssetRepo.clear();
    await tokenPriceRepo.clear();
    await tokenRepo.clear();
  });

  /**
   * @target lockedAssetsMetric should calculate and store locked assets USD metric
   * @dependency database
   * @scenario
   * - insert tokens
   * - insert locked assets
   * - insert latest token prices
   * - call lockedAssetsMetric
   * @expected
   * - metric TOTAL_LOCKED_ASSETS_USD is stored with correct summed value
   */
  it('should calculate and store locked assets USD metric', async () => {
    await tokenRepo.insert([
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo',
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo',
      },
    ]);

    await lockedAssetRepo.insert([
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-2', amount: BigInt(5) },
    ]);

    await tokenPriceRepo.insert([
      { tokenId: 'token-1', price: 10, timestamp: 2_000 },
      { tokenId: 'token-2', price: 4, timestamp: 2_000 },
      { tokenId: 'token-2', price: 3, timestamp: 3_000 },
    ]);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe('115');
  });

  /**
   * @target lockedAssetsMetric should not store metric if locked assets have no prices
   * @dependency database
   * @scenario
   * - insert token and locked asset
   * - do not insert token price
   * - call lockedAssetsMetric
   * @expected
   * - no metric is created
   */
  it('should not store metric if locked assets have no prices', async () => {
    await tokenRepo.insert({
      id: 'token-1',
      name: 'Token 1',
      decimal: 0,
      significantDecimal: 0,
      isNative: false,
      chain: 'ergo',
    });
    await lockedAssetRepo.insert({
      address: 'addr1',
      tokenId: 'token-1',
      amount: BigInt(10),
    });

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });
    expect(metric).toBeNull();
  });
});
