import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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
  let logger: AbstractLogger;
  let action: EventCountMetricAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
    logger = new DummyLogger();

    await eventTriggerRepo.clear();
    await eventCountRepo.clear();
    await metricRepo.clear();
    action = new EventCountMetricAction(dataSource, logger);
  });

  describe('getLastProcessedHeight', () => {
    /**
     * @target getLastProcessedHeight should return 0 when no event count records exist
     * @scenario
     * - No records in EventCountEntity table
     * - Call getLastProcessedHeight
     * @expected
     * - Returns 0
     */
    it('should return 0 when no records exist', async () => {
      const testData =
        eventCountMetricActionTestData.getLastProcessedHeightNoRecords;

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });

    /**
     * @target getLastProcessedHeight should return the highest lastProcessedHeight from existing records
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
     * @target getAggregatedEvents should aggregate events by status and chain pairs since last height
     * @scenario
     * - Insert events with different statuses (successful, fraud) and chain pairs
     * - Insert events below lastHeight and with null status (should be ignored)
     * - Call getAggregatedEvents with lastHeight = 100
     * @expected
     * - Returns 3 aggregated groups with correct counts (as numbers) and max heights
     * - Does not include events below lastHeight or with null status
     */
    it('should aggregate events by status and chain pairs since last height', async () => {
      const testData =
        eventCountMetricActionTestData.getAggregatedEventsMultipleGroups;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedEvents(testData.lastHeight);

      const sortedAggregated = [...aggregated].sort((a, b) => {
        if (a.status !== b.status) return a.status.localeCompare(b.status);
        if (a.fromChain !== b.fromChain)
          return a.fromChain.localeCompare(b.fromChain);
        return a.toChain.localeCompare(b.toChain);
      });

      const sortedExpected = [...testData.expectedAggregated].sort((a, b) => {
        if (a.status !== b.status) return a.status.localeCompare(b.status);
        if (a.fromChain !== b.fromChain)
          return a.fromChain.localeCompare(b.fromChain);
        return a.toChain.localeCompare(b.toChain);
      });

      expect(sortedAggregated).toEqual(sortedExpected);
    });

    /**
     * @target getAggregatedEvents should aggregate multiple events in same group into single record
     * @scenario
     * - Insert 3 successful events from ergo to cardano with different spendHeights
     * - Call getAggregatedEvents with lastHeight = 100
     * @expected
     * - Returns single group with count = 3 (as number) and lastProcessedHeight = 120
     */
    it('should aggregate multiple events in same group into single record', async () => {
      const testData =
        eventCountMetricActionTestData.getAggregatedEventsSameGroup;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedEvents(testData.lastHeight);

      expect(aggregated).toHaveLength(1);
      expect(aggregated[0]).toEqual({
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
      });
    });

    /**
     * @target getAggregatedEvents should return empty array when no events since last height
     * @scenario
     * - Insert events with spendHeight below lastHeight (150, 180) and lastHeight = 200
     * - Call getAggregatedEvents with lastHeight = 200
     * @expected
     * - Returns empty array
     */
    it('should return empty array when no events since last height', async () => {
      const testData =
        eventCountMetricActionTestData.getAggregatedEventsNoNewEvents;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedEvents(testData.lastHeight);

      expect(aggregated).toEqual([]);
    });
  });

  describe('getExistingEventCount', () => {
    /**
     * @target getExistingEventCount should return event count when record exists
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
     * @scenario
     * - No existing EventCountEntity or MetricEntity records
     * - Call upsertEventsCount with 2 aggregated event groups and totalCount = 4
     * @expected
     * - Creates 2 EventCountEntity records with correct counts and heights
     * - Records are ordered by status ASC (fraud first, then successful)
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
        order: { status: 'ASC', fromChain: 'ASC', toChain: 'ASC' },
      });

      expect(eventCounts).toHaveLength(testData.expectedEventCounts.length);

      eventCounts.forEach((record, index) => {
        const expected = testData.expectedEventCounts[index];
        expect(record.status).toBe(expected.status);
        expect(record.fromChain).toBe(expected.fromChain);
        expect(record.toChain).toBe(expected.toChain);
        expect(record.eventCount).toBe(expected.eventCount);
        expect(record.lastProcessedHeight).toBe(expected.lastProcessedHeight);
      });

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
      expect(metric?.updatedAt).toBeDefined();
    });

    /**
     * @target upsertEventsCount should replace existing event count records with new values
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
      if (testData.existingMetric) {
        await metricRepo.insert(testData.existingMetric);
      }

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find();
      expect(eventCounts).toHaveLength(1);
      expect(eventCounts[0].eventCount).toBe(2);
      expect(eventCounts[0].lastProcessedHeight).toBe(130);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe('7');
    });

    /**
     * @target upsertEventsCount should handle both new and existing groups in same transaction
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
     * - Records are ordered by status ASC (fraud first, then successful)
     * - Total metric is updated to '10'
     */
    it('should handle both new and existing groups in same transaction', async () => {
      const testData =
        eventCountMetricActionTestData.upsertEventsCountMixedGroups;

      await eventCountRepo.insert(testData.existingEventCounts);
      if (testData.existingMetric) {
        await metricRepo.insert(testData.existingMetric);
      }

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find({
        order: { status: 'ASC', fromChain: 'ASC', toChain: 'ASC' },
      });

      expect(eventCounts).toHaveLength(2);

      expect(eventCounts[0].status).toBe('fraud');
      expect(eventCounts[0].fromChain).toBe('cardano');
      expect(eventCounts[0].toChain).toBe('ergo');
      expect(eventCounts[0].eventCount).toBe(2);
      expect(eventCounts[0].lastProcessedHeight).toBe(115);

      expect(eventCounts[1].status).toBe('successful');
      expect(eventCounts[1].fromChain).toBe('ergo');
      expect(eventCounts[1].toChain).toBe('cardano');
      expect(eventCounts[1].eventCount).toBe(3);
      expect(eventCounts[1].lastProcessedHeight).toBe(120);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe('10');
    });

    /**
     * @target upsertEventsCount should update only total metric when aggregated events array is empty
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
      if (testData.existingMetric) {
        await metricRepo.insert(testData.existingMetric);
      }

      await action.upsertEventsCount(
        testData.aggregatedEvents,
        testData.totalCount,
      );

      const eventCounts = await eventCountRepo.find();
      expect(eventCounts).toHaveLength(1);
      expect(eventCounts[0].eventCount).toBe(5);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe('5');
    });

    /**
     * @target upsertEventsCount should rollback entire transaction on error
     * @scenario
     * - Mock createQueryRunner to throw database error
     * - Call upsertEventsCount with valid aggregated events
     * @expected
     * - Function throws error
     * - No EventCountEntity records are persisted
     * - No MetricEntity records are persisted
     */
    it('should rollback entire transaction on error', async () => {
      const testData =
        eventCountMetricActionTestData.upsertEventsCountNewGroups;

      vi.spyOn(
        eventCountRepo.manager.connection,
        'createQueryRunner',
      ).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        action.upsertEventsCount(
          testData.aggregatedEvents,
          testData.totalCount,
        ),
      ).rejects.toThrow('Database error');

      const eventCounts = await eventCountRepo.find();
      expect(eventCounts).toHaveLength(0);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric).toBeNull();

      vi.restoreAllMocks();
    });

    /**
     * @target upsertEventsCount should use provided totalCount for metric value regardless of aggregated events
     * @scenario
     * - Call upsertEventsCount with aggregated events and totalCount = 100
     * @expected
     * - MetricEntity EVENT_COUNT_TOTAL has value '100'
     */
    it('should use provided totalCount for metric value regardless of aggregated events', async () => {
      const testData =
        eventCountMetricActionTestData.upsertEventsCountNewGroups;

      await action.upsertEventsCount(testData.aggregatedEvents, 100);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
      });
      expect(metric?.value).toBe('100');
    });
  });
});
