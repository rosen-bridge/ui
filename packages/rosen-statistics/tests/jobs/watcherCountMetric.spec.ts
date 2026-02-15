/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import {
  METRIC_KEYS,
  MetricEntity,
  WatcherCountEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { watcherCountMetric, WatcherBoxService } from '../../lib';
import { watcherCountMetricTestData } from '../test-data';
import { createDatabase } from '../utils';

vi.mock('../../lib/services/WatcherBoxService');

describe('watcherCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let watcherCountRepo: Repository<WatcherCountEntity>;
  let logger: AbstractLogger;
  let mockFetchWatcherBoxes: any;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    watcherCountRepo = dataSource.getRepository(WatcherCountEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await watcherCountRepo.clear();

    mockFetchWatcherBoxes = vi.fn();
    (WatcherBoxService as any).mockImplementation(() => ({
      fetchWatcherBoxes: mockFetchWatcherBoxes,
      extractNetwork: vi.fn().mockImplementation((box) => box.network),
      extractWatcherCount: vi.fn().mockImplementation((box) => box.count),
    }));

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @target Should calculate watcher counts for multiple networks
   * @scenario
   * - Configure explorer client with multiple network mappings (ergo, cardano, ethereum)
   * - Mock fetchWatcherBoxes to return boxes for all three networks from test data
   * - Run watcherCountMetric
   * @expected
   * - Creates 3 WatcherCountEntity records with correct sums per network
   * - Updates total metric to sum of all watchers (11)
   */
  it('should calculate watcher counts for multiple networks', async () => {
    const testData = watcherCountMetricTestData.multipleNetworks;

    mockFetchWatcherBoxes.mockResolvedValue(testData.mockBoxes);

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
   * @scenario
   * - Configure explorer client with ergo network mapping
   * - Mock fetchWatcherBoxes to return 1 valid ergo boxes and 1 box without network from test data
   * - Run watcherCountMetric
   * @expected
   * - Creates 1 WatcherCountEntity record with sum of valid boxes only (5)
   * - Box without valid network is skipped
   * - Total metric = 5
   */
  it('should skip boxes without valid network', async () => {
    const testData = watcherCountMetricTestData.boxesWithoutValidNetwork;

    mockFetchWatcherBoxes.mockResolvedValue(testData.mockBoxes);

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
   * @scenario
   * - Configure explorer client with ergo network mapping
   * - Mock fetchWatcherBoxes to return empty array from test data
   * - Run watcherCountMetric
   * @expected
   * - No WatcherCountEntity records created
   * - Total metric = 0
   */
  it('should handle no boxes found', async () => {
    const testData = watcherCountMetricTestData.noBoxesFound;

    mockFetchWatcherBoxes.mockResolvedValue(testData.mockBoxes);

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
   * @scenario
   * - Configure node client with ergo network mapping
   * - Mock fetchWatcherBoxes to return boxes for ergo network from test data
   * - Run watcherCountMetric
   * @expected
   * - Creates 1 WatcherCountEntity record with sum of watchers (8)
   * - Updates total metric to 8
   */
  it('should work with node client configuration', async () => {
    const testData = watcherCountMetricTestData.nodeClientConfig;

    mockFetchWatcherBoxes.mockResolvedValue(testData.mockBoxes);

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
    expect(metric?.value).toBe(
      testData.expectedResults.totalWatchers.toString(),
    );
  });

  /**
   * @target Should handle errors from box service gracefully
   * @scenario
   * - Configure explorer client
   * - Mock fetchWatcherBoxes to throw error
   * - Run watcherCountMetric
   * @expected
   * - Error is caught and logged
   * - No data is persisted
   * - Metric remains unchanged
   */
  it('should handle errors from box service gracefully', async () => {
    const testData = watcherCountMetricTestData.multipleNetworks;

    mockFetchWatcherBoxes.mockRejectedValue(new Error('API error'));

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find();
    expect(watcherCounts).toHaveLength(0);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric).toBeNull();
  });
});
