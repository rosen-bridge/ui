import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  METRIC_KEYS,
  MetricEntity,
  EventCountEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { eventCountMetric } from '../../lib';
import { eventCountTestData } from '../test-data';
import { createDatabase } from '../utils';

describe('eventCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let eventCountRepo: Repository<EventCountEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await eventTriggerRepo.clear();
    await eventCountRepo.clear();
  });

  /**
   * @target Should aggregate new events and create event count records
   * @scenario
   * - Insert 4 new events with different and same (status, fromChain, toChain) combinations
   * - Run eventCountMetric
   * @expected
   * - Creates 3 EventCountEntity records with correct counts
   * - Updates total metric to sum of all events (4)
   */
  it('should aggregate new events and create event count records', async () => {
    const testData = eventCountTestData.newEventsTest1;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualEventCounts = await eventCountRepo.find({
      select: [
        'fromChain',
        'toChain',
        'eventCount',
        'status',
        'lastProcessedHeight',
      ],
    });

    expect(actualEventCounts).toHaveLength(
      testData.expectedResults.eventCounts.length,
    );

    expect(actualEventCounts).toEqual(testData.expectedResults.eventCounts);
  });

  /**
   * @target Should update existing counts with new events
   * @scenario
   * - Insert existing EventCountEntity (5 successful ergo→cardano)
   * - Insert existing total metric (value: 5)
   * - Insert 2 new events for same group
   * - Run eventCountMetric
   * @expected
   * - Updates existing EventCountEntity to 7
   * - Updates total metric to 7
   */
  it('should update existing counts with new events', async () => {
    const testData = eventCountTestData.updateExistingCounts;

    await eventCountRepo.insert(testData.eventCountRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualEventCounts = await eventCountRepo.find({
      select: [
        'fromChain',
        'toChain',
        'eventCount',
        'status',
        'lastProcessedHeight',
      ],
    });

    expect(actualEventCounts).toHaveLength(
      testData.expectedResults.eventCounts.length,
    );

    expect(actualEventCounts).toEqual(testData.expectedResults.eventCounts);
  });

  /**
   * @target Should ignore events below last processed height
   * @scenario
   * - Insert existing EventCountEntity with lastProcessedHeight = 100
   * - Insert event with spendHeight = 95 (below last processed)
   * - Insert event with spendHeight = 105 (above last processed)
   * - Run eventCountMetric
   * @expected
   * - EventCountEntity must update to count = 6
   * - Total metric must update to value = 6
   */
  it('should ignore events below last processed height', async () => {
    const testData = eventCountTestData.ignoreOldEvents;

    await eventCountRepo.insert(testData.eventCountRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const actualEventCounts = await eventCountRepo.find({
      select: [
        'fromChain',
        'toChain',
        'eventCount',
        'status',
        'lastProcessedHeight',
      ],
    });

    expect(actualEventCounts).toHaveLength(
      testData.expectedResults.eventCounts.length,
    );

    expect(actualEventCounts).toEqual(testData.expectedResults.eventCounts);
  });

  /**
   * @target Should filter out null status events
   * @scenario
   * - Insert 2 successful events and 1 null status event
   * - Run eventCountMetric
   * @expected
   * - Only counts successful/fraud events (2 total)
   * - null status event is ignored
   * - Total metric = 2
   */
  it('should filter out null status events', async () => {
    const testData = eventCountTestData.filterNullStatusEvents;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric?.value).toBe('2');

    const actualEventCounts = await eventCountRepo.find({
      select: [
        'fromChain',
        'toChain',
        'eventCount',
        'status',
        'lastProcessedHeight',
      ],
    });

    expect(actualEventCounts).toHaveLength(
      testData.expectedResults.eventCounts.length,
    );

    expect(actualEventCounts).toEqual(testData.expectedResults.eventCounts);
  });
});
