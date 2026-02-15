import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import {
  METRIC_KEYS,
  UserEventEntity,
  MetricEntity,
  UserEventMetricAction,
} from '../../lib';
import { userEventMetricActionTestData } from '../test-data';
import { createDatabase } from '../utils';

describe('UserEventMetricAction', () => {
  let dataSource: DataSource;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;
  let metricRepo: Repository<MetricEntity>;
  let blockRepo: Repository<BlockEntity>;
  let logger: AbstractLogger;
  let action: UserEventMetricAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    userEventRepo = dataSource.getRepository(UserEventEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    logger = new DummyLogger();

    await eventTriggerRepo.clear();
    await userEventRepo.clear();
    await metricRepo.clear();
    await blockRepo.clear();

    action = new UserEventMetricAction(dataSource, logger);
  });

  describe('getLastProcessedHeight', () => {
    /**
     * @target getLastProcessedHeight should return 0 when no user event records exist
     * @scenario
     * - No records in UserEventEntity table
     * - Call getLastProcessedHeight
     * @expected
     * - Successfully returns 0
     */
    it('should return 0 when no records exist', async () => {
      const testData =
        userEventMetricActionTestData.getLastProcessedHeightNoRecords;

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });

    /**
     * @target getLastProcessedHeight should return the highest lastProcessedHeight from existing records
     * @scenario
     * - Insert multiple UserEventEntity records with different lastProcessedHeight values (100, 120, 150)
     * - Call getLastProcessedHeight
     * @expected
     * - Successfully returns the maximum lastProcessedHeight value (150)
     */
    it('should return the highest lastProcessedHeight from existing records', async () => {
      const testData =
        userEventMetricActionTestData.getLastProcessedHeightMultipleRecords;

      await userEventRepo.insert(testData.userEventRepo);

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });
  });

  describe('getAggregatedEvents', () => {
    /**
     * @target getAggregatedEvents should aggregate successful events by address pairs since last height
     * @scenario
     * - Insert 3 successful events for addr1→addr2 (2 events) and addr3→addr4 (1 event)
     * - Insert 1 event below lastProcessedHeight (ignored)
     * - Insert 1 fraud event (ignored - only successful)
     * - Insert corresponding block records with valid timestamps
     * - Call getAggregatedEvents with lastProcessedHeight = 100, untilTimestamp = 1704153600
     * @expected
     * - Successfully returns 2 aggregated groups
     * - Each group has correct count and lastProcessedHeight
     * - Filters out events below lastProcessedHeight, non-successful status, and invalid timestamps
     */
    it('should aggregate successful events by address pairs since last height', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsMultipleAddresses;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await blockRepo.insert(testData.blockRepo);

      const aggregated = await action.getAggregatedEvents(
        testData.lastProcessedHeight,
        testData.untilTimestamp,
      );

      expect(aggregated).toEqual(testData.expectedAggregated);
    });

    /**
     * @target getAggregatedEvents should aggregate multiple events for same address pair into single record
     * @scenario
     * - Insert 3 successful events from addr1→addr2 with spendHeights 110, 115, 120
     * - Insert corresponding block records with valid timestamps
     * - Call getAggregatedEvents with lastProcessedHeight = 100, untilTimestamp = 1704153600
     * @expected
     * - Successfully returns single group
     * - Correctly aggregates count to '3' (as string)
     * - Correctly sets lastProcessedHeight to highest spendHeight (120)
     */
    it('should aggregate multiple events for same address pair into single record', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsSameAddress;

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
     * @scenario
     * - Insert event with spendHeight 150 (below lastProcessedHeight = 200)
     * - Insert corresponding block record
     * - Call getAggregatedEvents with lastProcessedHeight = 200, untilTimestamp = 1704153600
     * @expected
     * - Successfully returns empty array
     */
    it('should return empty array when no events since last height', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsNoNewEvents;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await blockRepo.insert(testData.blockRepo);

      const aggregated = await action.getAggregatedEvents(
        testData.lastProcessedHeight,
        testData.untilTimestamp,
      );

      expect(aggregated).toHaveLength(0);
    });

    /**
     * @target getAggregatedEvents should exclude events with timestamps above untilTimestamp
     * @scenario
     * - Insert 3 successful events
     * - 2 events have timestamps below untilTimestamp (included)
     * - 1 event has timestamp above untilTimestamp (excluded)
     * - Call getAggregatedEvents with lastProcessedHeight = 100, untilTimestamp = 1704074400
     * @expected
     * - Successfully returns 2 groups
     * - Excludes event with timestamp >= untilTimestamp
     */
    it('should exclude events with timestamps above untilTimestamp', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsExcludeByTimestamp;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await blockRepo.insert(testData.blockRepo);

      const aggregated = await action.getAggregatedEvents(
        testData.lastProcessedHeight,
        testData.untilTimestamp,
      );

      expect(aggregated).toEqual(testData.expectedAggregated);
    });
  });

  describe('getExistingUserEvent', () => {
    /**
     * @target getExistingUserEvent should return count when record exists
     * @scenario
     * - Insert UserEventEntity record for addr1→addr2 with count = 10
     * - Call getExistingUserEvent with same address pair
     * @expected
     * - Successfully returns existing count (10)
     */
    it('should return count when record exists', async () => {
      const testData = userEventMetricActionTestData.getExistingUserEventExists;

      await userEventRepo.insert(testData.userEventRepo);

      const count = await action.getExistingUserEvent(
        testData.fromAddress,
        testData.toAddress,
      );

      expect(count).toBe(testData.expectedCount);
    });

    /**
     * @target getExistingUserEvent should return 0 when record does not exist
     * @scenario
     * - Insert UserEventEntity record for addr3→addr4
     * - Call getExistingUserEvent with addr1→addr2 (different pair with no record)
     * @expected
     * - Successfully returns 0
     */
    it('should return 0 when record does not exist', async () => {
      const testData =
        userEventMetricActionTestData.getExistingUserEventNotExists;

      await userEventRepo.insert(testData.userEventRepo);

      const count = await action.getExistingUserEvent(
        testData.fromAddress,
        testData.toAddress,
      );

      expect(count).toBe(testData.expectedCount);
    });
  });

  describe('upsertEventsCount', () => {
    /**
     * @target upsertEventsCount should create new user event records and update total metric
     * @scenario
     * - No existing UserEventEntity or MetricEntity records
     * - Call upsertEventsCount with 2 aggregated user event groups and totalCount = 4
     * @expected
     * - Successfully creates 2 UserEventEntity records with correct counts and heights
     * - Successfully creates MetricEntity record with USER_EVENT_TOTAL = '4'
     */
    it('should create new user event records and update total metric', async () => {
      const testData = userEventMetricActionTestData.upsertEventsCountNewGroups;

      await action.upsertEventsCount(
        testData.aggregatedUsersEvents,
        testData.totalCount,
      );

      const userEvents = await userEventRepo.find({
        select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
      expect(metric?.updatedAt).toBeDefined();
    });

    /**
     * @target upsertEventsCount should replace existing user event records with new values
     * @scenario
     * - Insert existing UserEventEntity with count = 5 and lastProcessedHeight = 100
     * - Insert existing MetricEntity with USER_EVENT_TOTAL = '5'
     * - Call upsertEventsCount with aggregated event (count = 2, lastProcessedHeight = 130) and totalCount = 7
     * @expected
     * - Successfully REPLACES existing UserEventEntity with count = 2, height = 130
     * - Successfully updates MetricEntity to '7'
     */
    it('should replace existing user event records with new values', async () => {
      const testData =
        userEventMetricActionTestData.upsertEventsCountUpdateExisting;

      await userEventRepo.insert(testData.existingUserEvents);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertEventsCount(
        testData.aggregatedUsersEvents,
        testData.totalCount,
      );

      const userEvents = await userEventRepo.find({
        select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertEventsCount should handle both new and existing groups in same transaction
     * @scenario
     * - Insert existing UserEventEntity for addr1→addr2 (count = 5, height = 100)
     * - Insert existing MetricEntity with USER_EVENT_TOTAL = '5'
     * - Call upsertEventsCount with:
     *   - Existing group: addr1→addr2 (count = 3, height = 120)
     *   - New group: addr3→addr4 (count = 2, height = 115)
     *   - totalCount = 10
     * @expected
     * - Successfully replaces existing group with count = 3, height = 120
     * - Successfully creates new group with count = 2, height = 115
     * - Successfully updates total metric to '10'
     */
    it('should handle both new and existing groups in same transaction', async () => {
      const testData =
        userEventMetricActionTestData.upsertEventsCountMixedGroups;

      await userEventRepo.insert(testData.existingUserEvents);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertEventsCount(
        testData.aggregatedUsersEvents,
        testData.totalCount,
      );

      const userEvents = await userEventRepo.find({
        select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertEventsCount should update only total metric when aggregated events array is empty
     * @scenario
     * - Insert existing UserEventEntity with count = 5 and lastProcessedHeight = 100
     * - Insert existing MetricEntity with USER_EVENT_TOTAL = '5'
     * - Call upsertEventsCount with empty aggregatedUsersEvents array and totalCount = 5
     * @expected
     * - Successfully leaves existing UserEventEntity unchanged (count = 5, height = 100)
     * - Successfully updates total metric with provided totalCount value (still '5')
     */
    it('should update only total metric when aggregated events array is empty', async () => {
      const testData = userEventMetricActionTestData.upsertEventsCountEmpty;

      await userEventRepo.insert(testData.existingUserEvents);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertEventsCount(
        testData.aggregatedUsersEvents,
        testData.totalCount,
      );

      const userEvents = await userEventRepo.find({
        select: ['fromAddress', 'toAddress', 'count', 'lastProcessedHeight'],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });
  });
});
