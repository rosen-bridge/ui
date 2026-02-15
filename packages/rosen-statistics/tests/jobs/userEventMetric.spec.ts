import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  METRIC_KEYS,
  MetricEntity,
  UserEventEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { userEventMetric } from '../../lib';
import { userEventMetricTestData } from '../test-data';
import { createDatabase } from '../utils';

describe('userEventMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;
  let blockRepo: Repository<BlockEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    // Set system time to 2024-01-03 14:20:00 UTC
    // This makes yesterday's start = 2024-01-02 00:00:00 UTC (1704153600)
    vi.setSystemTime(new Date('2024-01-03T14:20:00Z'));

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

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * @target Should aggregate new user events and create event count records
   * @scenario
   * - Set system time to 2024-01-03 14:20:00 UTC (yesterday start = 2024-01-02 00:00:00 UTC)
   * - Insert 4 successful events with different address pairs
   * - Insert corresponding block records with timestamps before yesterday (Jan 1, 2024)
   * - Run userEventMetric
   * @expected
   * - Creates 3 UserEventEntity records with correct counts
   * - Updates total metric to sum of all events (4)
   */
  it('should aggregate new user events and create event count records', async () => {
    const testData = userEventMetricTestData.newEventsDifferentAddresses;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });

  /**
   * @target Should update existing counts with new events
   * @scenario
   * - Set system time to 2024-01-03 14:20:00 UTC
   * - Insert existing UserEventEntity (5 for addr1→addr2)
   * - Insert existing total metric (value: 5)
   * - Insert 2 new successful events for same address pair with timestamps before yesterday
   * - Run userEventMetric
   * @expected
   * - Updates existing UserEventEntity to 7
   * - Updates total metric to 7
   */
  it('should update existing counts with new events', async () => {
    const testData = userEventMetricTestData.updateExistingCounts;

    await userEventRepo.insert(testData.userEventRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });

  /**
   * @target Should ignore events below last processed height
   * @scenario
   * - Set system time to 2024-01-03 14:20:00 UTC
   * - Insert existing UserEventEntity with lastProcessedHeight = 100
   * - Insert event with spendHeight = 95 (below last processed)
   * - Insert event with spendHeight = 105 (above last processed)
   * - Insert corresponding block records with timestamps before yesterday
   * - Run userEventMetric
   * @expected
   * - UserEventEntity must update to count = 6
   * - Total metric must update to value = 6
   */
  it('should ignore events below last processed height', async () => {
    const testData = userEventMetricTestData.ignoreOldEvents;

    await userEventRepo.insert(testData.userEventRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });

  /**
   * @target Should filter out events with timestamps after yesterday's start
   * @scenario
   * - Set system time to 2024-01-03 14:20:00 UTC
   * - Insert 3 successful events
   * - 2 events have timestamps before yesterday's start (Jan 1, 2024)
   * - 1 event has timestamp equal to yesterday's start (Jan 2, 2024 00:00:00 UTC)
   * - Run userEventMetric
   * @expected
   * - Only counts events with timestamps < yesterdayTs (2 total)
   * - Events with timestamps >= yesterdayTs are ignored
   * - Total metric = 2
   */
  it("should filter out events with timestamps after yesterday's start", async () => {
    const testData = userEventMetricTestData.filterByTimestamp;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });

  /**
   * @target Should filter out non-successful events
   * @scenario
   * - Set system time to 2024-01-03 14:20:00 UTC
   * - Insert 2 successful events, 1 fraud event, 1 null status event
   * - Run userEventMetric
   * @expected
   * - Only counts successful events (2 total)
   * - Fraud and null status events are ignored
   * - Total metric = 2
   */
  it('should filter out non-successful events', async () => {
    const testData = userEventMetricTestData.filterNonSuccessfulEvents;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualUserEvents = await userEventRepo.find({
      select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
    });

    expect(actualUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );

    expect(actualUserEvents).toEqual(testData.expectedResults.userEvents);
  });
});
