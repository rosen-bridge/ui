import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import {
  METRIC_KEYS,
  MetricEntity,
  WatcherCountEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { watcherCountMetric } from '../../lib';
import {
  setupExplorerMock,
  setupNodeMock,
  resetMocks,
} from '../mocked/boxFetcher.mock';
import { watcherCountMetricTestData } from '../testData';
import { createDatabase } from '../utils';

describe('watcherCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let watcherCountRepo: Repository<WatcherCountEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    watcherCountRepo = dataSource.getRepository(WatcherCountEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await watcherCountRepo.clear();
    resetMocks();
  });

  /**
   * @target Should calculate watcher counts for multiple networks
   * @dependencies
   * - database
   * - ExplorerBoxFetcher
   * - calculateWatcherCounts
   * - WatcherCountMetricAction
   * - MetricAction
   * @scenario
   * - Configure explorer client with multiple network mappings (ergo, cardano, ethereum)
   * - Run watcherCountMetric
   * @expected
   * - Creates 3 WatcherCountEntity records with correct sums per network
   * - Updates total metric to sum of all watchers (11)
   */
  it('should calculate watcher counts for multiple networks', async () => {
    const testData = watcherCountMetricTestData.multipleNetworks;

    setupExplorerMock(testData.mockBoxes);

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find({
      select: ['network', 'count'],
    });
    expect(watcherCounts).toHaveLength(
      testData.expectedResults.watcherCounts.length,
    );
    expect(watcherCounts).toEqual(testData.expectedResults.watcherCounts);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalWatchers);
  });

  /**
   * @target Should skip boxes without valid network
   * @dependencies
   * - database
   * - ExplorerBoxFetcher
   * - calculateWatcherCounts
   * - WatcherCountMetricAction
   * - MetricAction
   * @scenario
   * - Configure explorer client with ergo network mapping
   * - Run watcherCountMetric
   * @expected
   * - Creates 1 WatcherCountEntity record with sum of valid boxes only (5)
   * - Box without valid network is skipped
   * - Total metric = 5
   */
  it('should skip boxes without valid network', async () => {
    const testData = watcherCountMetricTestData.boxesWithoutValidNetwork;

    setupExplorerMock(testData.mockBoxes);

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find({
      select: ['network', 'count'],
    });

    expect(watcherCounts).toHaveLength(
      testData.expectedResults.watcherCounts.length,
    );
    expect(watcherCounts).toEqual(testData.expectedResults.watcherCounts);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalWatchers);
  });

  /**
   * @target Should handle no boxes found
   * @dependencies
   * - database
   * - ExplorerBoxFetcher
   * - calculateWatcherCounts
   * - WatcherCountMetricAction
   * - MetricAction
   * @scenario
   * - Configure explorer client with ergo network mapping
   * - Run watcherCountMetric
   * @expected
   * - No WatcherCountEntity records created
   * - Total metric = 0
   */
  it('should handle no boxes found', async () => {
    const testData = watcherCountMetricTestData.noBoxesFound;

    setupExplorerMock(testData.mockBoxes);

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find();
    expect(watcherCounts).toHaveLength(0);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe('0');
  });

  /**
   * @target Should work with node client configuration
   * @dependencies
   * - database
   * - NodeBoxFetcher
   * - calculateWatcherCounts
   * - WatcherCountMetricAction
   * - MetricAction
   * @scenario
   * - Configure node client with multiple network mappings
   * - Mock fetchUnspentBoxesByTokenId to return boxes for multiple networks
   * - Run watcherCountMetric
   * @expected
   * - Creates WatcherCountEntity records for each network with correct sums
   * - Updates total metric to sum of all watchers (8)
   */
  it('should work with node client configuration', async () => {
    const testData = watcherCountMetricTestData.nodeClientConfig;

    setupNodeMock(testData.mockBoxes);

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find({
      select: ['network', 'count'],
    });

    expect(watcherCounts).toHaveLength(
      testData.expectedResults.watcherCounts.length,
    );
    expect(watcherCounts).toEqual(testData.expectedResults.watcherCounts);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalWatchers);
  });

  /**
   * @target Should preserve existing data when box service fails
   * @dependencies
   * - database
   * - ExplorerBoxFetcher
   * - calculateWatcherCounts
   * - WatcherCountMetricAction
   * - MetricAction
   * @scenario
   * - Insert existing watcher counts and total metric in database from testData
   * - Configure explorer client
   * - Mock fetchUnspentBoxesByTokenId to throw error
   * - Run watcherCountMetric
   * @expected
   * - Error is caught and logged
   * - Existing data remains unchanged in database matching expectedResults
   */
  it('should preserve existing data when box service fails', async () => {
    const testData = watcherCountMetricTestData.errorWithExistingData;

    await watcherCountRepo.save(testData.existingData.watcherCounts);
    await metricRepo.save(testData.existingData.totalMetric);

    setupExplorerMock(new Error('Network error'));

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find({
      select: ['network', 'count'],
    });
    expect(watcherCounts).toHaveLength(
      testData.expectedResults.watcherCounts.length,
    );
    expect(watcherCounts).toEqual(testData.expectedResults.watcherCounts);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalWatchers);
  });
});
