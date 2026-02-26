/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import {
  METRIC_KEYS,
  MetricEntity,
  WatcherCountEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { watcherCountMetric } from '../../lib';
import { ExplorerBoxFetcher, NodeBoxFetcher } from '../../lib/services';
import { watcherCountMetricTestData } from '../testData';
import { createDatabase } from '../utils';

vi.mock('../../lib/services/explorerBoxFetcher');
vi.mock('../../lib/services/nodeBoxFetcher');

describe('watcherCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let watcherCountRepo: Repository<WatcherCountEntity>;
  let logger: AbstractLogger;
  const mockFetchUnspentBoxesByTokenId = vi.fn();

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    watcherCountRepo = dataSource.getRepository(WatcherCountEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await watcherCountRepo.clear();

    const ExplorerBoxFetcherMock = vi.mocked(ExplorerBoxFetcher);
    ExplorerBoxFetcherMock.mockImplementation(
      () =>
        ({
          fetchUnspentBoxesByTokenId: mockFetchUnspentBoxesByTokenId,
        }) as any,
    );

    const NodeBoxFetcherMock = vi.mocked(NodeBoxFetcher);
    NodeBoxFetcherMock.mockImplementation(
      () =>
        ({
          fetchUnspentBoxesByTokenId: mockFetchUnspentBoxesByTokenId,
        }) as any,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @target Should calculate watcher counts for multiple networks
   * @dependencies
   * - database
   * - ExplorerBoxFetcher
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

    mockFetchUnspentBoxesByTokenId.mockResolvedValue(testData.mockBoxes);

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

    mockFetchUnspentBoxesByTokenId.mockResolvedValue(testData.mockBoxes);

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

    mockFetchUnspentBoxesByTokenId.mockResolvedValue(testData.mockBoxes);

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

    mockFetchUnspentBoxesByTokenId.mockResolvedValue(testData.mockBoxes);

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
   * @target Should handle errors from box service gracefully
   * @dependencies
   * - database
   * - ExplorerBoxFetcher
   * - WatcherCountMetricAction
   * - MetricAction
   * @scenario
   * - Configure explorer client
   * - Mock fetchUnspentBoxesByTokenId to throw error
   * - Run watcherCountMetric
   * @expected
   * - Error is caught and logged
   * - No data is persisted
   * - Metric remains unchanged (null)
   */
  it('should handle errors from box service gracefully', async () => {
    const testData = watcherCountMetricTestData.multipleNetworks;

    mockFetchUnspentBoxesByTokenId.mockRejectedValue(new Error('API error'));

    await watcherCountMetric(dataSource, testData.config, logger);

    const watcherCounts = await watcherCountRepo.find();
    expect(watcherCounts).toHaveLength(0);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric).toBeNull();
  });
});
