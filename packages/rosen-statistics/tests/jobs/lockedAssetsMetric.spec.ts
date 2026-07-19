import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { METRIC_KEYS, MetricEntity } from '@rosen-ui/rosen-statistics-entity';

import { beforeEach, describe, expect, it } from 'vitest';

import { lockedAssetsMetric } from '../../lib';
import { lockedAssetsTestData } from '../testData';
import { createDatabase } from '../utils';

describe('lockedAssetsMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let lockedAssetRepo: Repository<LockedAssetEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let logger: AbstractLogger;

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
   * @target lockedAssetsMetric should calculate correct USD value with mixed large and small numbers
   * @dependency database
   * @scenario
   * - Insert tokens with different decimal configurations
   * - Insert locked assets with varying amounts
   * - Insert token prices (large and small)
   * - Call lockedAssetsMetric
   * @expected
   * - Metric value matches expected precision calculation
   */
  it('should calculate correct USD value with mixed large and small numbers', async () => {
    const testData = lockedAssetsTestData.test1;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should not store metric if locked assets have no prices
   * @dependency database
   * @scenario
   * - Insert token and locked asset
   * - Do not insert token price
   * - Call lockedAssetsMetric
   * @expected
   * - No metric is created
   */
  it('should not store metric if locked assets have no prices', async () => {
    const testData = lockedAssetsTestData.test2;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric).toBeNull();
  });

  /**
   * @target lockedAssetsMetric should handle extremely large numbers without precision loss
   * @dependency database
   * @scenario
   * - Insert token with large amount and high price
   * - Call lockedAssetsMetric
   * @expected
   * - Metric value maintains precision for large numbers
   */
  it('should handle extremely large numbers without precision loss', async () => {
    const testData = lockedAssetsTestData.test3;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should handle extremely small numbers
   * @dependency database
   * @scenario
   * - Insert token with microscopic price (e.g., 1e-15)
   * - Call lockedAssetsMetric
   * @expected
   * - Metric value maintains precision for small numbers
   */
  it('should handle extremely small numbers', async () => {
    const testData = lockedAssetsTestData.test4;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should handle zero amounts correctly
   * @dependency database
   * @scenario
   * - Insert locked asset with zero amount
   * - Call lockedAssetsMetric
   * @expected
   * - Metric value should be '0'
   */
  it('should handle zero amounts correctly', async () => {
    const testData = lockedAssetsTestData.test5;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric).not.toBeNull();
    expect(metric?.value).toBe('0');
  });

  /**
   * @target lockedAssetsMetric should handle tokens with different decimal places
   * @dependency database
   * @scenario
   * - Insert tokens with varying decimal places (0, 6, 9, 18)
   * - Insert corresponding locked assets
   * - Call lockedAssetsMetric
   * @expected
   * - Metric correctly handles different decimal configurations
   */
  it('should handle tokens with different decimal places', async () => {
    const testData = lockedAssetsTestData.test6;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should skip assets without prices
   * @dependency database
   * @scenario
   * - Insert multiple locked assets
   * - Only provide prices for some tokens
   * - Call lockedAssetsMetric
   * @expected
   * - Only assets with prices are included in calculation
   */
  it('should skip assets without prices', async () => {
    const testData = lockedAssetsTestData.test7;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should use latest prices based on timestamp
   * @dependency database
   * @scenario
   * - Insert multiple price entries for same token with different timestamps
   * - Call lockedAssetsMetric
   * @expected
   * - Uses latest price (closest to current timestamp)
   */
  it('should use latest prices based on timestamp', async () => {
    const testData = lockedAssetsTestData.test8;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should handle scientific notation prices
   * @dependency database
   * @scenario
   * - Insert token prices in scientific notation (e.g., 2e-8, 1.5e12)
   * - Call lockedAssetsMetric
   * @expected
   * - Correctly converts scientific notation to decimal
   */
  it('should handle scientific notation prices', async () => {
    const testData = lockedAssetsTestData.test9;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should update existing metric
   * @dependency database
   * @scenario
   * - Call lockedAssetsMetric twice
   * - Second call should update existing metric
   * @expected
   * - Only one metric exists with updated value
   */
  it('should update existing metric', async () => {
    const testData = lockedAssetsTestData.test1;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    await lockedAssetsMetric(dataSource, logger);

    const metrics = await metricRepo.find({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metrics).toHaveLength(1);
    expect(metrics[0].value).toBe(testData.expectedTotalUsd);
  });

  /**
   * @target lockedAssetsMetric should handle mixed token decimals correctly
   * @dependency database
   * @scenario
   * - Insert tokens with different significantDecimals
   * - Insert prices with different decimal places
   * - Call lockedAssetsMetric
   * @expected
   * - Final value maintains precision across different decimal configurations
   */
  it('should handle mixed token decimals correctly', async () => {
    const testData = lockedAssetsTestData.test10;

    await tokenRepo.insert(testData.tokenRepo);
    await lockedAssetRepo.insert(testData.lockedAssetRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);

    await lockedAssetsMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD },
    });

    expect(metric?.value).toBe(testData.expectedTotalUsd);
  });
});
