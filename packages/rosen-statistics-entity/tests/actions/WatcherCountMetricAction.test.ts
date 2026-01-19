/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { describe, it, expect, beforeEach, vitest } from 'vitest';

import { WatcherCountMetricAction } from '../../lib/actions/WatcherCountMetricAction';
import { METRIC_KEYS, RWT_NETWORK_MAP } from '../../lib/constants';
import { MetricEntity, WatcherCountEntity } from '../../lib/entities';
import { createDatabase } from '../utils';

describe('WatcherCountMetricAction', () => {
  let dataSource: DataSource;
  let action: WatcherCountMetricAction;
  let watcherRepo: Repository<WatcherCountEntity>;
  let metricRepo: Repository<MetricEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new WatcherCountMetricAction(dataSource, {
      type: 'explorer',
      url: 'explorerUrl',
      rwtTokenId: 'repoNFT',
    });
    watcherRepo = dataSource.getRepository(WatcherCountEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
  });

  /**
   * @target calculateAndStoreWatcherCounts should calculate and store watcher counts from explorer client
   * @dependency database
   *
   * @scenario
   * - mock explorer response with multiple watcher boxes
   * - each box contains a watcher count and an RWT token identifying its network
   * - invoke calculateAndStoreWatcherCounts
   *
   * @expected
   * - watcher counts are stored per network in WatcherCountEntity
   * - total watcher count metric is calculated as the sum of all networks
   * - WATCHER_COUNT_TOTAL metric is stored with the correct aggregated value
   */
  it('should calculate and store watcher counts from explorer client', async () => {
    vitest.spyOn(action as any, 'fetchBoxesUsingExplorer').mockResolvedValue([
      {
        register_value: () => ({ to_i64: () => ({ to_str: () => '10' }) }),
        tokens: () => ({
          len: () => 1,
          get: () => ({
            id: () => ({
              to_str: () =>
                '30e4392fc439fce9948da124efddb8779fe179eef5a5d6196e249b75ee64defc',
            }),
          }),
        }),
      },
      {
        register_value: () => ({ to_i64: () => ({ to_str: () => '20' }) }),
        tokens: () => ({
          len: () => 1,
          get: () => ({
            id: () => ({
              to_str: () =>
                '5d727b722fb72aa02257d987970c68aeda41614518bab9f0d8a21bbc75b7a3b0',
            }),
          }),
        }),
      },
    ] as any);

    await action.calculateAndStoreWatcherCounts();

    const updated1 = await watcherRepo.findOne({
      where: {
        network:
          RWT_NETWORK_MAP[
            '30e4392fc439fce9948da124efddb8779fe179eef5a5d6196e249b75ee64defc'
          ],
      },
    });
    expect(updated1).not.toBeNull();
    expect(updated1?.count).toBe(10);

    const updated2 = await watcherRepo.findOne({
      where: {
        network:
          RWT_NETWORK_MAP[
            '5d727b722fb72aa02257d987970c68aeda41614518bab9f0d8a21bbc75b7a3b0'
          ],
      },
    });
    expect(updated2).not.toBeNull();
    expect(updated2?.count).toBe(20);

    const metric = await metricRepo.find({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric.length).toBe(1);
    expect(metric[0]?.value).toBe('30');
  });

  /**
   * @target calculateAndStoreWatcherCounts should update existing watcher count
   * @dependency database
   *
   * @scenario
   * - an existing watcher count record already exists for a network
   * - explorer returns a box with an updated watcher count
   * - invoke calculateAndStoreWatcherCounts
   *
   * @expected
   * - existing watcher count record is overwritten with the new value
   * - total watcher count metric reflects only the latest calculated data
   */
  it('should update existing watcher count', async () => {
    await watcherRepo.insert({
      network:
        RWT_NETWORK_MAP[
          '5d727b722fb72aa02257d987970c68aeda41614518bab9f0d8a21bbc75b7a3b0'
        ],
      count: 5,
    });

    vitest.spyOn(action as any, 'fetchBoxesUsingExplorer').mockResolvedValue([
      {
        register_value: () => ({ to_i64: () => ({ to_str: () => '15' }) }),
        tokens: () => ({
          len: () => 1,
          get: () => ({
            id: () => ({
              to_str: () =>
                '30e4392fc439fce9948da124efddb8779fe179eef5a5d6196e249b75ee64defc',
            }),
          }),
        }),
      },
    ] as any);

    await action.calculateAndStoreWatcherCounts();

    const updated = await watcherRepo.findOne({
      where: {
        network:
          RWT_NETWORK_MAP[
            '30e4392fc439fce9948da124efddb8779fe179eef5a5d6196e249b75ee64defc'
          ],
      },
    });
    expect(updated).not.toBeNull();
    expect(updated?.count).toBe(15);

    const metric = await metricRepo.find({
      where: { key: METRIC_KEYS.WATCHER_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric.length).toBe(1);
    expect(metric[0]?.value).toBe('15');
  });
});
