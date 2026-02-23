import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { METRIC_KEYS, MetricEntity } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { lockedAssetsMetric } from '../../lib';
import { lockedAssetsTestData } from '../testData';
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
    await tokenRepo.insert(lockedAssetsTestData.test1.tokenRepo);

    await lockedAssetRepo.insert(lockedAssetsTestData.test1.lockedAssetRepo);

    await tokenPriceRepo.insert(lockedAssetsTestData.test1.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe('221');
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
    await tokenRepo.insert(lockedAssetsTestData.test2.tokenRepo);
    await lockedAssetRepo.insert(lockedAssetsTestData.test2.lockedAssetRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });
    expect(metric).toBeNull();
  });
});
