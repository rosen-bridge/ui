import { beforeEach, describe, expect, it } from 'vitest';

import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  METRIC_KEYS,
  MetricEntity,
  UserEventEntity,
} from '@rosen-ui/rosen-statistics-entity';

import { userEventMetric } from '../../lib';
import { userEventMetricTestData } from '../testData';
import { createDatabase } from '../utils';

describe('userEventMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;
  let blockRepo: Repository<BlockEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    userEventRepo = dataSource.getRepository(UserEventEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await eventTriggerRepo.clear();
    await userEventRepo.clear();
    await blockRepo.clear();
  });

  /**
   * @target Should aggregate new user events and create user event records
   * @dependencies
   * - database
   * - UserEventMetricAction
   * - MetricAction
   * - BlockDbAction
   * @scenario
   * - Insert 6 new events with different address pairs (all successful)
   * - Insert corresponding block records
   * - lastProcessedHeight = 0, untilProcessedHeight = 121 (last block height - 720)
   * - Run userEventMetric
   * @expected
   * - Creates 4 UserEventEntity records with correct counts (events with height <= 121)
   * - Updates total metric to 3 ( unique address pairs counted )
   */
  it('should aggregate new events and create user event records', async () => {
    const testData = userEventMetricTestData.newEventsDifferentAddresses;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: [
        'fromAddress',
        'fromChain',
        'toAddress',
        'toChain',
        'count',
        'lastProcessedHeight',
      ],
    });
    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });

  /**
   * @target Should update existing user event counts with new events
   * @dependencies
   * - database
   * - UserEventMetricAction
   * - MetricAction
   * - BlockDbAction
   * @scenario
   * - Insert existing UserEventEntity (5 count for addr1→addr2 at height 100)
   * - Insert existing total metric (value: 1)
   * - Insert 2 new successful events for same address pair (heights 115, 116)
   * - Insert corresponding block records
   * - lastProcessedHeight = 100, untilProcessedHeight = 116 => 2 events are valid
   * - Run userEventMetric
   * @expected
   * - Updates existing UserEventEntity to count 7 with lastProcessedHeight 116
   * - Updates total metric to 1 ( unique address pair already counted )
   */
  it('should update existing counts with new events', async () => {
    const testData = userEventMetricTestData.updateExistingCounts;

    await userEventRepo.insert(testData.userEventRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: [
        'fromAddress',
        'fromChain',
        'toAddress',
        'toChain',
        'count',
        'lastProcessedHeight',
      ],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });

  /**
   * @target Should filter out non-successful events
   * @dependencies
   * - database
   * - UserEventMetricAction
   * - MetricAction
   * - BlockDbAction
   * @scenario
   * - Insert 2 successful events, 1 fraud event, and 1 null status event
   * - Insert corresponding block records
   * - lastProcessedHeight = 0, untilProcessedHeight = 112 => 2 successful events are valid
   * - Run userEventMetric
   * @expected
   * - Only counts successful events (2 total)
   * - Fraud and null status events are ignored
   * - Total metric = 1 (only one unique address pair )
   */
  it('should filter out non-successful events', async () => {
    const testData = userEventMetricTestData.filterNonSuccessfulEvents;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: [
        'fromAddress',
        'fromChain',
        'toAddress',
        'toChain',
        'count',
        'lastProcessedHeight',
      ],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });
});
