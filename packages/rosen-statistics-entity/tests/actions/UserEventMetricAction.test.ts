import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import { UserEventMetricAction } from '../../lib/actions/UserEventMetricAction';
import { UserEventEntity } from '../../lib/entities';
import {
  userEventLastProcessedHeightScenarios,
  userEventAggregatedScenarios,
  userEventExistingScenarios,
  userEventUpsertScenarios,
} from '../test-data/test-data';
import { createDatabase } from '../utils';

describe('UserEventMetricAction', () => {
  let dataSource: DataSource;
  let action: UserEventMetricAction;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new UserEventMetricAction(dataSource);

    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    userEventRepo = dataSource.getRepository(UserEventEntity);
  });

  describe('getLastProcessedHeight', () => {
    beforeEach(async () => {
      await userEventRepo.clear();
    });

    /**
     * @target getLastProcessedHeight should return 0 when no user event records exist
     * @dependency database
     * @scenario
     * - ensure no UserEventEntity records exist
     * - call getLastProcessedHeight
     * @expected
     * - returns 0
     */
    it('should return 0 when no user event records exist', async () => {
      const scenario = userEventLastProcessedHeightScenarios.empty;
      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getLastProcessedHeight should return highest lastProcessedHeight
     * @dependency database
     * @scenario
     * - insert UserEventEntity records with different lastProcessedHeights
     * - call getLastProcessedHeight
     * @expected
     * - returns the highest lastProcessedHeight
     */
    it('should return the highest lastProcessedHeight', async () => {
      const scenario = userEventLastProcessedHeightScenarios.multipleRecords;
      await userEventRepo.insert(scenario.userEventRepo);

      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getLastProcessedHeight should return value when only one record exists
     * @dependency database
     * @scenario
     * - insert single UserEventEntity record
     * - call getLastProcessedHeight
     * @expected
     * - returns the lastProcessedHeight of the single record
     */
    it('should return value when only one record exists', async () => {
      const scenario = userEventLastProcessedHeightScenarios.singleRecord;
      await userEventRepo.insert(scenario.userEventRepo);

      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });
  });

  describe('getAggregatedEvents', () => {
    beforeEach(async () => {
      await eventTriggerRepo.clear();
    });

    /**
     * @target getAggregatedEvents should return empty array when no events exist
     * @dependency database
     * @scenario
     * - call getAggregatedEvents on empty database
     * @expected
     * - returns empty array
     */
    it('should return empty array when no events exist', async () => {
      const scenario = userEventAggregatedScenarios.emptyDatabase;
      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);
    });

    /**
     * @target getAggregatedEvents should aggregate multiple events for same user pair
     * @dependency database
     * @scenario
     * - insert multiple EventTriggerEntity records for same fromAddress/toAddress
     * - call getAggregatedEvents
     * @expected
     * - returns aggregated count for the user pair
     * - calculates correct maxHeight
     */
    it('should aggregate multiple events for same user pair', async () => {
      const scenario = userEventAggregatedScenarios.aggregateSameUserPair;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.fromAddress === expectedGroup.fromAddress &&
          r.toAddress === expectedGroup.toAddress,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.userCount).toBe(expectedGroup.userCount);
      expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
    });

    /**
     * @target getAggregatedEvents should filter by spendHeight > lastHeight
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records with different spendHeights
     * - call getAggregatedEvents with specific lastHeight
     * @expected
     * - returns only events with spendHeight > lastHeight
     */
    it('should filter by spendHeight > lastHeight', async () => {
      const scenario = userEventAggregatedScenarios.filterByLastHeight;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.fromAddress === expectedGroup.fromAddress &&
          r.toAddress === expectedGroup.toAddress,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.userCount).toBe(expectedGroup.userCount);
      expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
    });

    /**
     * @target getAggregatedEvents should ignore non-successful events
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records with different statuses
     * - call getAggregatedEvents
     * @expected
     * - returns only events with status 'successful'
     */
    it('should ignore non-successful events', async () => {
      const scenario = userEventAggregatedScenarios.ignoreNonSuccessfulEvents;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.fromAddress === expectedGroup.fromAddress &&
          r.toAddress === expectedGroup.toAddress,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.userCount).toBe(expectedGroup.userCount);
      expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
    });

    /**
     * @target getAggregatedEvents should handle complex scenario with multiple user pairs
     * @dependency database
     * @scenario
     * - insert multiple EventTriggerEntity records with various user pairs
     * - call getAggregatedEvents
     * @expected
     * - all user pairs correctly aggregated
     */
    it('should handle complex scenario with multiple user pairs', async () => {
      const scenario = userEventAggregatedScenarios.complexScenario;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      for (const expectedGroup of scenario.expectedGroups) {
        const actualGroup = result.find(
          (r) =>
            r.fromAddress === expectedGroup.fromAddress &&
            r.toAddress === expectedGroup.toAddress,
        );

        expect(actualGroup).toBeDefined();
        expect(actualGroup?.userCount).toBe(expectedGroup.userCount);
        expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
      }
    });

    /**
     * @target getAggregatedEvents should handle events below last processed height
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records below and above lastHeight threshold
     * - call getAggregatedEvents
     * @expected
     * - returns only events with spendHeight > lastHeight
     */
    it('should handle events below last processed height', async () => {
      const scenario = userEventAggregatedScenarios.eventsBelowLastHeight;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.fromAddress === expectedGroup.fromAddress &&
          r.toAddress === expectedGroup.toAddress,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.userCount).toBe(expectedGroup.userCount);
      expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
    });
  });

  describe('getExistingUserEvent', () => {
    beforeEach(async () => {
      await userEventRepo.clear();
    });

    /**
     * @target getExistingUserEvent should return null when no matching record exists
     * @dependency database
     * @scenario
     * - call getExistingUserEvent for non-existent user pair
     * @expected
     * - returns null
     */
    it('should return null when no matching record exists', async () => {
      const scenario = userEventExistingScenarios.noMatch;
      await userEventRepo.insert(scenario.userEventRepo);

      const result = await action.getExistingUserEvent(
        scenario.query.fromAddress,
        scenario.query.toAddress,
      );

      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getExistingUserEvent should return existing UserEventEntity
     * @dependency database
     * @scenario
     * - insert UserEventEntity record
     * - call getExistingUserEvent for matching user pair
     * @expected
     * - returns the matching UserEventEntity
     */
    it('should return existing UserEventEntity', async () => {
      const scenario = userEventExistingScenarios.exactMatch;
      await userEventRepo.insert(scenario.userEventRepo);

      const result = await action.getExistingUserEvent(
        scenario.query.fromAddress,
        scenario.query.toAddress,
      );

      expect(result).not.toBeNull();
      expect(result?.fromAddress).toBe(scenario.expected?.fromAddress);
      expect(result?.toAddress).toBe(scenario.expected?.toAddress);
      expect(result?.count).toBe(scenario.expected?.count);
    });

    /**
     * @target getExistingUserEvent should be case-sensitive for addresses
     * @dependency database
     * @scenario
     * - insert UserEventEntity with lowercase addresses
     * - call getExistingUserEvent with uppercase addresses
     * @expected
     * - returns null (addresses are case-sensitive)
     */
    it('should be case-sensitive for addresses', async () => {
      const scenario = userEventExistingScenarios.caseSensitiveAddresses;
      await userEventRepo.insert(scenario.userEventRepo);

      const result = await action.getExistingUserEvent(
        scenario.query.fromAddress,
        scenario.query.toAddress,
      );

      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getExistingUserEvent should find correct record among multiple
     * @dependency database
     * @scenario
     * - insert multiple UserEventEntity records
     * - call getExistingUserEvent for specific user pair
     * @expected
     * - returns the correct matching record
     */
    it('should find correct record among multiple', async () => {
      const scenario = userEventExistingScenarios.multipleRecords;
      await userEventRepo.insert(scenario.userEventRepo);

      const result = await action.getExistingUserEvent(
        scenario.query.fromAddress,
        scenario.query.toAddress,
      );

      expect(result).not.toBeNull();
      expect(result?.fromAddress).toBe(scenario.expected?.fromAddress);
      expect(result?.toAddress).toBe(scenario.expected?.toAddress);
      expect(result?.count).toBe(scenario.expected?.count);
    });
  });

  describe('upsertUserEventCount', () => {
    beforeEach(async () => {
      await userEventRepo.clear();
    });

    /**
     * @target upsertUserEventCount should insert new user event record
     * @dependency database
     * @scenario
     * - call upsertUserEventCount with new data
     * - verify record was created
     * @expected
     * - new UserEventEntity record is created
     */
    it('should insert new user event record', async () => {
      const scenario = userEventUpsertScenarios.insertNew;
      await userEventRepo.insert(scenario.initialData);

      await action.upsertUserEventCount(
        scenario.upsertData.fromAddress,
        scenario.upsertData.toAddress,
        scenario.upsertData.count,
        scenario.upsertData.maxHeight,
      );

      const allRecords = await userEventRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await userEventRepo.findOne({
        where: {
          fromAddress: scenario.expectedRecord.fromAddress,
          toAddress: scenario.expectedRecord.toAddress,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
      expect(result?.lastProcessedHeight).toBe(
        scenario.expectedRecord.lastProcessedHeight,
      );
    });

    /**
     * @target upsertUserEventCount should update existing user event record
     * @dependency database
     * @scenario
     * - insert existing UserEventEntity
     * - call upsertUserEventCount with same user pair but different data
     * - verify record was updated
     * @expected
     * - existing UserEventEntity record is updated
     */
    it('should update existing user event record', async () => {
      const scenario = userEventUpsertScenarios.updateExisting;
      await userEventRepo.insert(scenario.initialData);

      await action.upsertUserEventCount(
        scenario.upsertData.fromAddress,
        scenario.upsertData.toAddress,
        scenario.upsertData.count,
        scenario.upsertData.maxHeight,
      );

      const allRecords = await userEventRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await userEventRepo.findOne({
        where: {
          fromAddress: scenario.expectedRecord.fromAddress,
          toAddress: scenario.expectedRecord.toAddress,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
      expect(result?.lastProcessedHeight).toBe(
        scenario.expectedRecord.lastProcessedHeight,
      );
    });

    /**
     * @target upsertUserEventCount should handle zero count
     * @dependency database
     * @scenario
     * - call upsertUserEventCount with count = 0
     * @expected
     * - record is created with zero count
     */
    it('should handle zero count', async () => {
      const scenario = userEventUpsertScenarios.zeroCount;
      await userEventRepo.insert(scenario.initialData);

      await action.upsertUserEventCount(
        scenario.upsertData.fromAddress,
        scenario.upsertData.toAddress,
        scenario.upsertData.count,
        scenario.upsertData.maxHeight,
      );

      const allRecords = await userEventRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await userEventRepo.findOne({
        where: {
          fromAddress: scenario.expectedRecord.fromAddress,
          toAddress: scenario.expectedRecord.toAddress,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
    });

    /**
     * @target upsertUserEventCount should handle multiple updates to same user pair
     * @dependency database
     * @scenario
     * - call upsertUserEventCount multiple times with same user pair
     * @expected
     * - last update wins
     */
    it('should handle multiple updates to same user pair', async () => {
      const scenario = userEventUpsertScenarios.updateMultipleTimes;
      await userEventRepo.insert(scenario.initialData);

      for (const operation of scenario.upsertOperations) {
        await action.upsertUserEventCount(
          operation.fromAddress,
          operation.toAddress,
          operation.count,
          operation.maxHeight,
        );
      }

      const allRecords = await userEventRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await userEventRepo.findOne({
        where: {
          fromAddress: scenario.expectedRecord.fromAddress,
          toAddress: scenario.expectedRecord.toAddress,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
      expect(result?.lastProcessedHeight).toBe(
        scenario.expectedRecord.lastProcessedHeight,
      );
    });

    /**
     * @target upsertUserEventCount should treat different address directions as separate pairs
     * @dependency database
     * @scenario
     * - call upsertUserEventCount with addr1->addr2 and addr2->addr1
     * @expected
     * - creates two separate records
     */
    it('should treat different address directions as separate pairs', async () => {
      const scenario = userEventUpsertScenarios.duplicateAddressPairs;
      await userEventRepo.insert(scenario.initialData);

      for (const operation of scenario.upsertOperations) {
        await action.upsertUserEventCount(
          operation.fromAddress,
          operation.toAddress,
          operation.count,
          operation.maxHeight,
        );
      }

      const allRecords = await userEventRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      // Verify both pairs exist with correct values
      for (const expectedRecord of scenario.expectedRecords) {
        const result = await userEventRepo.findOne({
          where: {
            fromAddress: expectedRecord.fromAddress,
            toAddress: expectedRecord.toAddress,
          },
        });

        expect(result).not.toBeNull();
        expect(result?.count).toBe(expectedRecord.count);
        expect(result?.lastProcessedHeight).toBe(
          expectedRecord.lastProcessedHeight,
        );
      }
    });
  });
});
