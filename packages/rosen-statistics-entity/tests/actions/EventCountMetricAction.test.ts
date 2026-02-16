import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import {
  METRIC_KEYS,
  EventCountEntity,
  MetricEntity,
  EventCountMetricAction,
} from '../../lib';
import { eventCountMetricActionTestData } from '../test-data';
import { createDatabase } from '../utils';

describe('EventCountMetricAction', () => {
  let dataSource: DataSource;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let eventCountRepo: Repository<EventCountEntity>;
  let metricRepo: Repository<MetricEntity>;
  let blockRepo: Repository<BlockEntity>;
  let logger: AbstractLogger;
  let action: EventCountMetricAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    logger = new DummyLogger();

    await eventTriggerRepo.clear();
    await eventCountRepo.clear();
    await metricRepo.clear();
    await blockRepo.clear();

    action = new EventCountMetricAction(dataSource, logger);
  });

  describe('getLastProcessedHeight', () => {
    /**
     * @target getLastProcessedHeight should return 0 when no event count records exist
     * @dependencies
     * - database
     * @scenario
     * - No records in EventCountEntity table
     * - Call getLastProcessedHeight
     * @expected
     * - Returns 0
     */
    it('should return 0 when no event count records exist', async () => {
      const testData =
        eventCountMetricActionTestData.getLastProcessedHeightNoRecords;

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });

    /**
     * @target getLastProcessedHeight should return the highest lastProcessedHeight from existing records
     * @dependencies
     * - database
     * @scenario
     * - Insert multiple EventCountEntity records with different lastProcessedHeight values
     * - Call getLastProcessedHeight
     * @expected
     * - Returns the maximum lastProcessedHeight value (150)
     */
    it('should return the highest lastProcessedHeight from existing records', async () => {
      const testData =
        eventCountMetricActionTestData.getLastProcessedHeightMultipleRecords;

      await eventCountRepo.insert(testData.eventCountRepo);

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });
  });

  describe('getAggregatedEvents', () => {
    /**
     * @target getAggregatedEvents should aggregate events by status and chain pairs since last height up to timestamp
     * @dependencies
     * - database
     * @scenario
     * - Insert events above lastProcessedHeight with valid timestamps
     * - Insert events below lastProcessedHeight (should be ignored)
     * - Insert events equal lastProcessedHeight (should be ignored)
     * - Insert event with null status (should be ignored)
     * - Insert events equal timestamp (should be ignored)
     * - Insert events above timestamp (should be ignored)
     * - Call getAggregatedEvents with lastProcessedHeight = 100, untilTimestamp = 2000000
     * @expected
     * - Returns 3 aggregated groups with correct counts
     * - Does not include events below lastProcessedHeight or with null status
     */
    it('should aggregate events by status and chain pairs since last height up to timestamp', async () => {
      const testData =
        eventCountMetricActionTestData.getAggregatedEventsMultipleGroups;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await blockRepo.insert(testData.blockRepo);

      const aggregated = await action.getAggregatedEvents(
        testData.lastProcessedHeight,
        testData.untilTimestamp,
      );

      expect(aggregated).toEqual(testData.expectedAggregated);
    });

    /**
     * @target getAggregatedEvents should aggregate multiple events in same group into single record
     * @dependencies
     * - database
     * @scenario
     * - Insert 3 successful events from ergo to cardano with different spendHeights
     * - Insert corresponding block records with valid timestamps
     * - Call getAggregatedEvents with lastProcessedHeight = 100, untilTimestamp = 2000000
     * @expected
     * - Returns single group with count = 3 (as number) and lastProcessedHeight = 120
     */
    it('should aggregate multiple events in same group into single record', async () => {
      const testData =
        eventCountMetricActionTestData.getAggregatedEventsSameGroup;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await blockRepo.insert(testData.blockRepo);

      const aggregated = await action.getAggregatedEvents(
        testData.lastProcessedHeight,
        testData.untilTimestamp,
      );

      expect(aggregated).toHaveLength(testData.expectedAggregated.length);
      expect(aggregated).toEqual(testData.expectedAggregated);
    });

    /**
     * @target getAggregatedEvents should return empty array when no events since last height
     * @dependencies
     * - database
     * @scenario
     * - Insert events with spendHeight below lastProcessedHeight (150, 180) and lastProcessedHeight = 200
     * - Call getAggregatedEvents with lastProcessedHeight = 200
     * @expected
     * - Returns empty array
     */
    it('should return empty array when no events since last height', async () => {
      const testData =
        eventCountMetricActionTestData.getAggregatedEventsNoNewEvents;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await blockRepo.insert(testData.blockRepo);

      const aggregated = await action.getAggregatedEvents(
        testData.lastProcessedHeight,
        testData.untilTimestamp,
      );

      expect(aggregated).toHaveLength(0);
    });
  });

  describe('getExistingEventCount', () => {
    /**
     * @target getExistingEventCount should return event count when record exists
     * @dependencies
     * - database
     * @scenario
     * - Insert EventCountEntity record for successful ergo→cardano with count = 10
     * - Call getExistingEventCount with same status and chain pair
     * @expected
     * - Returns 10
     */
    it('should return event count when record exists', async () => {
      const testData =
        eventCountMetricActionTestData.getExistingEventCountExists;

      await eventCountRepo.insert(testData.eventCountRepo);

      const count = await action.getExistingEventCount(
        testData.status,
        testData.fromChain,
        testData.toChain,
      );

      expect(count).toBe(testData.expectedCount);
    });

    /**
     * @target getExistingEventCount should return 0 when record does not exist
     * @dependencies
     * - database
     * @scenario
     * - Insert EventCountEntity record for successful ergo→cardano
     * - Call getExistingEventCount with fraud status (no record exists)
     * @expected
     * - Returns 0
     */
    it('should return 0 when record does not exist', async () => {
      const testData =
        eventCountMetricActionTestData.getExistingEventCountNotExists;

      await eventCountRepo.insert(testData.eventCountRepo);

      const count = await action.getExistingEventCount(
        testData.status,
        testData.fromChain,
        testData.toChain,
      );

      expect(count).toBe(testData.expectedCount);
    });
  });

  describe('upsertEventsCount', () => {
    /**
     * @target upsertEventsCount should create new event count records and update total metric
     * @dependencies
     * - database
     * @scenario
     * - No existing EventCountEntity or MetricEntity records
     * - Call upsertEventsCount with 2 aggregated event groups and totalCount = 4
     * @expected
     * - Creates 2 EventCountEntity records with correct counts and heights
     * - Creates MetricEntity record with EVENT_COUNT_TOTAL = '4'
     * - All operations succeed in same transaction
     */
    it('should create new event count records and update total metric', async () => {
      const testData =
        eventCountMetricActionTestData.upsertEventsCountNewGroups;

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find({
        select: [
          'fromChain',
          'toChain',
          'eventCount',
          'status',
          'lastProcessedHeight',
        ],
      });

      expect(eventCounts).toHaveLength(testData.expectedEventCounts.length);
      expect(eventCounts).toEqual(testData.expectedEventCounts);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
      expect(metric?.updatedAt).toBeDefined();
    });

    /**
     * @target upsertEventsCount should replace existing event count records with new values
     * @dependencies
     * - database
     * @scenario
     * - Insert existing EventCountEntity with count = 5 and lastProcessedHeight = 100
     * - Insert existing MetricEntity with EVENT_COUNT_TOTAL = '5'
     * - Call upsertEventsCount with aggregated event (count = 2, lastProcessedHeight = 130) and totalCount = 7
     * @expected
     * - Existing EventCountEntity is REPLACED (not added) with count = 2, height = 130
     * - MetricEntity is updated to '7'
     */
    it('should replace existing event count records with new values', async () => {
      const testData =
        eventCountMetricActionTestData.upsertEventsCountUpdateExisting;

      await eventCountRepo.insert(testData.existingEventCounts);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find({
        select: [
          'fromChain',
          'toChain',
          'eventCount',
          'status',
          'lastProcessedHeight',
        ],
      });

      expect(eventCounts).toHaveLength(testData.expectedEventCounts.length);
      expect(eventCounts).toEqual(testData.expectedEventCounts);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertEventsCount should handle both new and existing groups in same transaction
     * @dependencies
     * - database
     * @scenario
     * - Insert existing EventCountEntity for successful ergo→cardano (count = 5)
     * - Insert existing MetricEntity with EVENT_COUNT_TOTAL = '5'
     * - Call upsertEventsCount with:
     *   - Existing group: successful ergo→cardano (count = 3, height = 120)
     *   - New group: fraud cardano→ergo (count = 2, height = 115)
     *   - totalCount = 10
     * @expected
     * - Existing group is replaced with count = 3, height = 120
     * - New group is created with count = 2, height = 115
     * - Total metric is updated to '10'
     */
    it('should handle both new and existing groups in same transaction', async () => {
      const testData =
        eventCountMetricActionTestData.upsertEventsCountMixedGroups;

      await eventCountRepo.insert(testData.existingEventCounts);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find({
        select: [
          'fromChain',
          'toChain',
          'eventCount',
          'status',
          'lastProcessedHeight',
        ],
      });

      expect(eventCounts).toHaveLength(testData.expectedEventCounts.length);
      expect(eventCounts).toEqual(testData.expectedEventCounts);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertEventsCount should update only total metric when aggregated events array is empty
     * @dependencies
     * - database
     * @scenario
     * - Insert existing EventCountEntity with count = 5
     * - Insert existing MetricEntity with EVENT_COUNT_TOTAL = '5'
     * - Call upsertEventsCount with empty aggregatedEvents array and totalCount = 5
     * @expected
     * - Existing EventCountEntity remains unchanged (count = 5)
     * - Total metric is updated with provided totalCount value (still '5')
     */
    it('should update only total metric when aggregated events array is empty', async () => {
      const testData = eventCountMetricActionTestData.upsertEventsCountEmpty;

      await eventCountRepo.insert(testData.existingEventCounts);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find({
        select: [
          'fromChain',
          'toChain',
          'eventCount',
          'status',
          'lastProcessedHeight',
        ],
      });

      expect(eventCounts).toHaveLength(testData.expectedEventCounts.length);
      expect(eventCounts).toEqual(testData.expectedEventCounts);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });
  });
});
