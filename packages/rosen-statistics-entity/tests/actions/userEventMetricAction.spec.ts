import { beforeEach, describe, expect, it } from 'vitest';

import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import {
  METRIC_KEYS,
  MetricEntity,
  UserEventEntity,
  UserEventMetricAction,
} from '../../lib';
import { userEventMetricActionTestData } from '../testData';
import { createDatabase } from '../utils';

describe('UserEventMetricAction', () => {
  let dataSource: DataSource;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;
  let metricRepo: Repository<MetricEntity>;
  let logger: AbstractLogger;
  let action: UserEventMetricAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    userEventRepo = dataSource.getRepository(UserEventEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
    logger = new DummyLogger();

    await eventTriggerRepo.clear();
    await userEventRepo.clear();
    await metricRepo.clear();

    action = new UserEventMetricAction(dataSource, logger);
  });

  describe('getLastProcessedHeight', () => {
    /**
     * @target getLastProcessedHeight should return 0 when no user event records exist
     * @dependencies
     * - database
     * - UserEventMetricAction
     * @scenario
     * - No records in UserEventEntity table
     * - Call getLastProcessedHeight
     * @expected
     * - Returns 0 (default value when no records exist)
     */
    it('should return 0 when no records exist', async () => {
      const testData =
        userEventMetricActionTestData.getLastProcessedHeightNoRecords;

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });

    /**
     * @target getLastProcessedHeight should return the highest lastProcessedHeight from existing records
     * @dependencies
     * - database
     * - UserEventMetricAction
     * @scenario
     * - Insert multiple UserEventEntity records with different lastProcessedHeight values
     *   - addr1→addr2: lastProcessedHeight = 100
     *   - addr3→addr4: lastProcessedHeight = 120
     *   - addr5→addr6: lastProcessedHeight = 150
     * - Call getLastProcessedHeight
     * @expected
     * - Returns the maximum lastProcessedHeight value (150)
     */
    it('should return the highest lastProcessedHeight from existing records', async () => {
      const testData =
        userEventMetricActionTestData.getLastProcessedHeightMultipleRecords;

      await userEventRepo.insert(testData.userEventRepo);

      const height = await action.getLastProcessedHeight();

      expect(height).toBe(testData.expectedHeight);
    });
  });

  describe('getAggregatedUsersEvents', () => {
    /**
     * @target getAggregatedUsersEvents should aggregate successful events by address pairs
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - EventTriggerEntity
     * @scenario
     * - Insert events with various spendHeights:
     *   - Below lastProcessedHeight (99) - excluded
     *   - Equal to lastProcessedHeight (100) - excluded
     *   - Above lastProcessedHeight (101, 115) - included
     *   - Equal to untilProcessedHeight (120) - excluded
     *   - Non-successful status (120) - excluded
     * - Call getAggregatedUsersEvents with lastProcessedHeight=100, untilProcessedHeight=120
     * @expected
     * - Returns 2 aggregated groups:
     *   - addr1→addr2: count=2 (events at 101 and 115), lastProcessedHeight=115
     *   - addr3→addr4: count=1 (event at 112), lastProcessedHeight=112
     */
    it('should aggregate successful events by address pairs', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsMultipleAddresses;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedUsersEvents(
        testData.lastProcessedHeight,
        testData.untilProcessedHeight,
      );

      expect(aggregated).toEqual(testData.expectedAggregated);
    });

    /**
     * @target getAggregatedUsersEvents should aggregate multiple events for same address pair into single record
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - EventTriggerEntity
     * @scenario
     * - Insert 3 successful events from addr1→addr2 with spendHeights 110, 115, 120
     * - Call getAggregatedUsersEvents with lastProcessedHeight=100, untilProcessedHeight=130
     * @expected
     * - Returns single group with:
     *   - count = 3 (all events aggregated)
     *   - lastProcessedHeight = 120 (max height)
     */
    it('should aggregate multiple events for same address pair into single record', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsSameAddress;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedUsersEvents(
        testData.lastProcessedHeight,
        testData.untilProcessedHeight,
      );

      expect(aggregated).toHaveLength(testData.expectedAggregated.length);
      expect(aggregated).toEqual(testData.expectedAggregated);
    });

    /**
     * @target getAggregatedUsersEvents should return empty array when no events since last height
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - EventTriggerEntity
     * @scenario
     * - Insert events with spendHeights:
     *   - 150 (below lastProcessedHeight=200) - excluded
     *   - 200 (equal to lastProcessedHeight) - excluded
     * - Call getAggregatedUsersEvents with lastProcessedHeight=200, untilProcessedHeight=300
     * @expected
     * - Returns empty array (no events in valid range)
     */
    it('should return empty array when no events since last height', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsNoNewEvents;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedUsersEvents(
        testData.lastProcessedHeight,
        testData.untilProcessedHeight,
      );

      expect(aggregated).toHaveLength(0);
    });

    /**
     * @target getAggregatedUsersEvents should exclude events with spendHeight at or above untilProcessedHeight
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - EventTriggerEntity
     * @scenario
     * - Insert events with spendHeights:
     *   - 110 (below untilProcessedHeight=115) - included
     *   - 115 (equal to untilProcessedHeight) - excluded
     *   - 120 (above untilProcessedHeight) - excluded
     * - Call getAggregatedUsersEvents with lastProcessedHeight=100, untilProcessedHeight=115
     * @expected
     * - Returns single group with:
     *   - count = 1 (only event at height 110)
     *   - lastProcessedHeight = 110
     */
    it('should exclude events with spendHeight at or above untilProcessedHeight', async () => {
      const testData =
        userEventMetricActionTestData.getAggregatedEventsExcludeByHeight;

      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const aggregated = await action.getAggregatedUsersEvents(
        testData.lastProcessedHeight,
        testData.untilProcessedHeight,
      );

      expect(aggregated).toEqual(testData.expectedAggregated);
    });
  });

  describe('getExistingUserEvent', () => {
    /**
     * @target getExistingUserEvent should return count when record exists
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - UserEventEntity
     * @scenario
     * - Insert UserEventEntity record for addr1→addr2 with count = 10
     * - Call getExistingUserEvent with same address pair
     * @expected
     * - Returns existing count (10)
     */
    it('should return count when record exists', async () => {
      const testData = userEventMetricActionTestData.getExistingUserEventExists;

      await userEventRepo.insert(testData.userEventRepo);

      const count = await action.getExistingUserEvent(
        testData.fromAddress,
        testData.fromChain,
        testData.toAddress,
        testData.toChain,
      );

      expect(count).toBe(testData.expectedCount);
    });

    /**
     * @target getExistingUserEvent should return 0 when record does not exist
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - UserEventEntity
     * @scenario
     * - Insert UserEventEntity record for addr3→addr4
     * - Call getExistingUserEvent with addr1→addr2 (different pair with no record)
     * @expected
     * - Returns 0 (default for non-existent records)
     */
    it('should return 0 when record does not exist', async () => {
      const testData =
        userEventMetricActionTestData.getExistingUserEventNotExists;

      await userEventRepo.insert(testData.userEventRepo);

      const count = await action.getExistingUserEvent(
        testData.fromAddress,
        testData.fromChain,
        testData.toAddress,
        testData.toChain,
      );

      expect(count).toBe(testData.expectedCount);
    });
  });

  describe('upsertUserEventsCount', () => {
    /**
     * @target upsertUserEventsCount should create new user event records and update total metric
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - UserEventEntity
     * - MetricEntity
     * @scenario
     * - No existing UserEventEntity or MetricEntity records
     * - Call upsertUserEventsCount with:
     *   - 2 aggregated user event groups
     * @expected
     * - Creates 2 UserEventEntity records with correct counts and heights
     * - Creates MetricEntity record with USER_COUNT_TOTAL = '2'(total unique groups after upsert)
     */
    it('should create new user event records and update total metric', async () => {
      const testData = userEventMetricActionTestData.upsertEventsCountNewGroups;

      await action.upsertUserEventsCount(testData.aggregatedUsersEvents);

      const userEvents = await userEventRepo.find({
        select: [
          'fromAddress',
          'fromChain',
          'toAddress',
          'toChain',
          'count',
          'lastProcessedHeight',
        ],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertUserEventsCount should replace existing user event records with new values
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - UserEventEntity
     * - MetricEntity
     * @scenario
     * - Insert existing UserEventEntity with count = 5 and lastProcessedHeight = 100
     * - Insert existing MetricEntity with USER_COUNT_TOTAL = '1'
     * - Call upsertUserEventsCount with:
     *   - aggregated event (count = 2, lastProcessedHeight = 130)
     * @expected
     * - REPLACES existing UserEventEntity (count becomes 2, height becomes 130)
     * - Updates MetricEntity to '1'(total unique groups after upsert remains 1)
     */
    it('should replace existing user event records with new values', async () => {
      const testData =
        userEventMetricActionTestData.upsertEventsCountUpdateExisting;

      await userEventRepo.insert(testData.existingUserEvents);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertUserEventsCount(testData.aggregatedUsersEvents);

      const userEvents = await userEventRepo.find({
        select: [
          'fromAddress',
          'fromChain',
          'toAddress',
          'toChain',
          'count',
          'lastProcessedHeight',
        ],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertUserEventsCount should handle both new and existing groups in same transaction
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - UserEventEntity
     * - MetricEntity
     * @scenario
     * - Insert existing UserEventEntity for addr1→addr2 (count = 5, height = 100)
     * - Insert existing MetricEntity with USER_COUNT_TOTAL = '1'
     * - Call upsertUserEventsCount with:
     *   - Existing group: addr1→addr2 (count = 3, height = 120)
     *   - New group: addr3→addr4 (count = 2, height = 115)
     * @expected
     * - Replaces existing group with count = 3, height = 120
     * - Creates new group with count = 2, height = 115
     * - Updates total metric to '2' (total unique groups after upsert)
     */
    it('should handle both new and existing groups in same transaction', async () => {
      const testData =
        userEventMetricActionTestData.upsertEventsCountMixedGroups;

      await userEventRepo.insert(testData.existingUserEvents);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertUserEventsCount(testData.aggregatedUsersEvents);

      const userEvents = await userEventRepo.find({
        select: [
          'fromAddress',
          'fromChain',
          'toAddress',
          'toChain',
          'count',
          'lastProcessedHeight',
        ],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertUserEventsCount should update only total metric when aggregated events array is empty
     * @dependencies
     * - database
     * - UserEventMetricAction
     * - UserEventEntity
     * - MetricEntity
     * @scenario
     * - Insert existing UserEventEntity with count = 5 and lastProcessedHeight = 100
     * - Insert existing MetricEntity with USER_COUNT_TOTAL = '1'
     * - Call upsertUserEventsCount with:
     *   - empty aggregatedUsersEvents array
     * @expected
     * - Existing UserEventEntity remains unchanged (count = 5, height = 100)
     * - Updates total metric with provided totalCount value (still '1' since no new groups added)
     */
    it('should update only total metric when aggregated events array is empty', async () => {
      const testData = userEventMetricActionTestData.upsertEventsCountEmpty;

      await userEventRepo.insert(testData.existingUserEvents);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertUserEventsCount(testData.aggregatedUsersEvents);

      const userEvents = await userEventRepo.find({
        select: [
          'fromAddress',
          'fromChain',
          'toAddress',
          'toChain',
          'count',
          'lastProcessedHeight',
        ],
      });

      expect(userEvents).toHaveLength(testData.expectedUserEvents.length);
      expect(userEvents).toEqual(testData.expectedUserEvents);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });
  });
});
