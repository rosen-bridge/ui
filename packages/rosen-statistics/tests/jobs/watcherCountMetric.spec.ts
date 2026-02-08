/* eslint-disable @typescript-eslint/no-explicit-any */
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { METRIC_KEYS, MetricEntity } from '@rosen-ui/rosen-statistics-entity';
import { WatcherCountEntity } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { watcherCountMetric } from '../../lib';
import { watcherConfig, watcherCountTestData } from '../test-data';
import { createDatabase } from '../utils';

vi.mock('../../lib/services/WatcherBoxService', () => {
  return {
    WatcherBoxService: vi.fn().mockImplementation(() => ({
      fetchWatcherBoxes: vi.fn(),
      extractWatcherCount: vi.fn(),
      extractNetwork: vi.fn(),
    })),
  };
});

describe('watcherCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let watcherCountRepo: Repository<WatcherCountEntity>;
  let logger: DummyLogger;
  let mockWatcherBoxService: any;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    watcherCountRepo = dataSource.getRepository(WatcherCountEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await watcherCountRepo.clear();

    vi.clearAllMocks();

    const { WatcherBoxService } = await import('../../lib');
    mockWatcherBoxService = {
      fetchWatcherBoxes: vi.fn(),
      extractWatcherCount: vi.fn(),
      extractNetwork: vi.fn(),
    };
    (WatcherBoxService as any).mockImplementation(() => mockWatcherBoxService);

    mockWatcherBoxService.extractWatcherCount.mockImplementation((box: any) => {
      const value = (box as any).register_value().to_i64().to_str();
      return parseInt(value);
    });
    mockWatcherBoxService.extractNetwork.mockImplementation((box: any) => {
      const tokenId = (box as any).tokens().get().id().to_str();
      const networkMap = watcherConfig.rwtNetworkMap;
      for (const [network, id] of Object.entries(networkMap)) {
        if (id === tokenId) return network;
      }
      return null;
    });
  });

  /**
   * @target watcherCountMetric should calculate and store watcher counts for multiple networks
   * @dependency database, WatcherBoxService
   * @scenario
   * - mock WatcherBoxService to return boxes for multiple networks
   * - call watcherCountMetric
   * @expected
   * - WatcherCountEntity rows created for each network
   * - total metric WATCHER_COUNT_TOTAL updated with correct sum
   */
  it('should calculate and store watcher counts for multiple networks', async () => {
    const testData = watcherCountTestData.test1;

    mockWatcherBoxService.fetchWatcherBoxes.mockResolvedValue(testData.boxes);

    await watcherCountMetric(dataSource, watcherConfig, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(
      testData.expectedResults.totalWatchers.toString(),
    );

    for (const expected of testData.expectedResults.networkCounts) {
      const countRecord = await watcherCountRepo.findOne({
        where: { network: expected.network },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.count).toBe(expected.count);
    }
    const allCounts = await watcherCountRepo.find();
    expect(allCounts).toHaveLength(
      testData.expectedResults.networkCounts.length,
    );
  });

  /**
   * @target watcherCountMetric should update existing watcher counts
   * @dependency database, WatcherBoxService
   * @scenario
   * - insert existing WatcherCountEntity records
   * - mock WatcherBoxService to return boxes with updated counts
   * - call watcherCountMetric
   * @expected
   * - existing WatcherCountEntity records updated with new values
   * - total metric recalculated with updated counts
   */
  it('should update existing watcher counts', async () => {
    const testData = watcherCountTestData.test2;

    await watcherCountRepo.insert(testData.watcherCountRepo);
    await metricRepo.insert(testData.metricRepo);

    mockWatcherBoxService.fetchWatcherBoxes.mockResolvedValue(testData.boxes);
    await watcherCountMetric(dataSource, watcherConfig, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(
      testData.expectedResults.totalWatchers.toString(),
    );

    for (const expected of testData.expectedResults.networkCounts) {
      const countRecord = await watcherCountRepo.findOne({
        where: { network: expected.network },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.count).toBe(expected.count);
    }

    const allCounts = await watcherCountRepo.find();
    expect(allCounts).toHaveLength(
      testData.expectedResults.networkCounts.length,
    );
  });

  /**
   * @target watcherCountMetric should handle all configured networks
   * @dependency database, WatcherBoxService
   * @scenario
   * - mock WatcherBoxService to return boxes for all configured networks
   * - call watcherCountMetric
   * @expected
   * - watcher counts stored for all networks
   * - total metric equals sum of all network counts
   */
  it('should handle all configured networks', async () => {
    const testData = watcherCountTestData.test3;

    mockWatcherBoxService.fetchWatcherBoxes.mockResolvedValue(testData.boxes);
    await watcherCountMetric(dataSource, watcherConfig, logger);

    for (const expected of testData.expectedResults.networkCounts) {
      const countRecord = await watcherCountRepo.findOne({
        where: { network: expected.network },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.count).toBe(expected.count);
    }

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalWatchers.toString(),
    );

    const allCounts = await watcherCountRepo.find();
    expect(allCounts).toHaveLength(
      testData.expectedResults.networkCounts.length,
    );
  });
});
