import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  EventCountEntity,
  METRIC_KEYS,
  MetricEntity,
} from '@rosen-ui/rosen-statistics-entity';

import { beforeEach, describe, expect, it } from 'vitest';

import { eventCountMetric } from '../../lib';
import { eventCountTestData } from '../testData';
import { createDatabase } from '../utils';

describe('eventCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let eventCountRepo: Repository<EventCountEntity>;
  let blockRepo: Repository<BlockEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await eventTriggerRepo.clear();
    await eventCountRepo.clear();
    await blockRepo.clear();
  });

  /**
   * @target Should aggregate new events and create event count records
   * @dependencies
   * - database
   * - EventCountMetricAction
   * - MetricAction
   * - BlockDbAction
   * @scenario
   * - Insert 6 new events with different and same (status, fromChain, toChain) combinations
   * - Insert corresponding block records (last PROCEED hight is 841)
   * - lastProcessedHeight = 0 ,untilProcessedHeight: 121 => 4 events are valid
   * - Run eventCountMetric
   * @expected
   * - Creates 3 EventCountEntity records with correct counts
   * - Updates total metric to sum of all events (4)
   */
  it('should aggregate new events and create event count records', async () => {
    const testData = eventCountTestData.newEventsTest1;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);
    await blockRepo.insert(testData.blockRepo);

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
   * @dependencies
   * - database
   * - EventCountMetricAction
   * - MetricAction
   * - BlockDbAction
   * @scenario
   * - Insert existing EventCountEntity (5 successful ergo→cardano + some events that must be ignore)
   * - Insert existing total metric (value: 5)
   * - Insert corresponding block records (last PROCEED hight is 837)
   * - lastProcessedHeight = 100 ,untilProcessedHeight: 116 => 4 events are valid
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
    await blockRepo.insert(testData.blockRepo);

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
   * @dependencies
   * - database
   * - EventCountMetricAction
   * - MetricAction
   * - BlockDbAction
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
    await blockRepo.insert(testData.blockRepo);

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
});
