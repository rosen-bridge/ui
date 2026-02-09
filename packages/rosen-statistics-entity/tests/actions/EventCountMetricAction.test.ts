import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import { EventCountMetricAction } from '../../lib/actions/EventCountMetricAction';
import { EventCountEntity } from '../../lib/entities';
import {
  lastProcessedHeightScenarios,
  aggregatedEventsScenarios,
  existingEventCountScenarios,
  upsertEventCountScenarios,
} from '../test-data/test-data';
import { createDatabase } from '../utils';

describe('EventCountMetricAction', () => {
  let dataSource: DataSource;
  let action: EventCountMetricAction;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let eventCountRepo: Repository<EventCountEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new EventCountMetricAction(dataSource);

    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
  });

  describe('getLastProcessedHeight', () => {
    beforeEach(async () => {
      await eventCountRepo.clear();
    });

    /**
     * @target getLastProcessedHeight should return 0 when no event count records exist
     * @dependency database
     * @scenario
     * - ensure no EventCountEntity records exist
     * - call getLastProcessedHeight
     * @expected
     * - returns 0
     */
    it('should return 0 when no event count records exist', async () => {
      const scenario = lastProcessedHeightScenarios.empty;
      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getLastProcessedHeight should return highest lastProcessedHeight
     * @dependency database
     * @scenario
     * - insert EventCountEntity records with different lastProcessedHeights
     * - call getLastProcessedHeight
     * @expected
     * - returns the highest lastProcessedHeight
     */
    it('should return the highest lastProcessedHeight', async () => {
      const scenario = lastProcessedHeightScenarios.multipleRecords;
      await eventCountRepo.insert(scenario.eventCountRepo);

      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getLastProcessedHeight should return value when only one record exists
     * @dependency database
     * @scenario
     * - insert single EventCountEntity record
     * - call getLastProcessedHeight
     * @expected
     * - returns the lastProcessedHeight of the single record
     */
    it('should return value when only one record exists', async () => {
      const scenario = lastProcessedHeightScenarios.singleRecord;
      await eventCountRepo.insert(scenario.eventCountRepo);

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
      const scenario = aggregatedEventsScenarios.emptyDatabase;
      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);
    });

    /**
     * @target getAggregatedEvents should group by status, fromChain, toChain
     * @dependency database
     * @scenario
     * - insert multiple EventTriggerEntity records with same group
     * - call getAggregatedEvents
     * @expected
     * - returns aggregated count for each group
     * - calculates correct maxHeight per group
     */
    it('should group by status, fromChain, toChain', async () => {
      const scenario = aggregatedEventsScenarios.aggregateSameGroup;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.status === expectedGroup.status &&
          r.fromChain === expectedGroup.fromChain &&
          r.toChain === expectedGroup.toChain,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.eventCount).toBe(expectedGroup.eventCount);
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
      const scenario = aggregatedEventsScenarios.filterByLastHeight;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.status === expectedGroup.status &&
          r.fromChain === expectedGroup.fromChain &&
          r.toChain === expectedGroup.toChain,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.eventCount).toBe(expectedGroup.eventCount);
      expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
    });

    /**
     * @target getAggregatedEvents should ignore non-successful/fraud events
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records with different statuses
     * - call getAggregatedEvents
     * @expected
     * - returns only events with status 'successful' or 'fraud'
     */
    it('should ignore non-successful/fraud events', async () => {
      const scenario = aggregatedEventsScenarios.ignoreNonSuccessfulFraud;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      const expectedGroup = scenario.expectedGroups[0];
      const actualGroup = result.find(
        (r) =>
          r.status === expectedGroup.status &&
          r.fromChain === expectedGroup.fromChain &&
          r.toChain === expectedGroup.toChain,
      );

      expect(actualGroup).toBeDefined();
      expect(actualGroup?.eventCount).toBe(expectedGroup.eventCount);
      expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
    });

    /**
     * @target getAggregatedEvents should handle complex scenario with multiple groups
     * @dependency database
     * @scenario
     * - insert multiple EventTriggerEntity records with various groups
     * - call getAggregatedEvents
     * @expected
     * - all groups correctly aggregated
     */
    it('should handle complex scenario with multiple groups', async () => {
      const scenario = aggregatedEventsScenarios.complexScenario;
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getAggregatedEvents(scenario.lastHeight);

      expect(result).toHaveLength(scenario.expectedCount);

      for (const expectedGroup of scenario.expectedGroups) {
        const actualGroup = result.find(
          (r) =>
            r.status === expectedGroup.status &&
            r.fromChain === expectedGroup.fromChain &&
            r.toChain === expectedGroup.toChain,
        );

        expect(actualGroup).toBeDefined();
        expect(actualGroup?.eventCount).toBe(expectedGroup.eventCount);
        expect(actualGroup?.maxHeight).toBe(expectedGroup.maxHeight);
      }
    });
  });

  describe('getExistingEventCount', () => {
    beforeEach(async () => {
      await eventCountRepo.clear();
    });

    /**
     * @target getExistingEventCount should return null when no matching record exists
     * @dependency database
     * @scenario
     * - call getExistingEventCount for non-existent group
     * @expected
     * - returns null
     */
    it('should return null when no matching record exists', async () => {
      const scenario = existingEventCountScenarios.noMatch;
      await eventCountRepo.insert(scenario.eventCountRepo);

      const result = await action.getExistingEventCount(
        scenario.query.status,
        scenario.query.fromChain,
        scenario.query.toChain,
      );

      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getExistingEventCount should return existing EventCountEntity
     * @dependency database
     * @scenario
     * - insert EventCountEntity record
     * - call getExistingEventCount for matching group
     * @expected
     * - returns the matching EventCountEntity
     */
    it('should return existing EventCountEntity', async () => {
      const scenario = existingEventCountScenarios.exactMatch;
      await eventCountRepo.insert(scenario.eventCountRepo);

      const result = await action.getExistingEventCount(
        scenario.query.status,
        scenario.query.fromChain,
        scenario.query.toChain,
      );

      expect(result).not.toBeNull();
      expect(result?.status).toBe(scenario.expected?.status);
      expect(result?.fromChain).toBe(scenario.expected?.fromChain);
      expect(result?.toChain).toBe(scenario.expected?.toChain);
      expect(result?.eventCount).toBe(scenario.expected?.eventCount);
    });

    /**
     * @target getExistingEventCount should be case-sensitive
     * @dependency database
     * @scenario
     * - insert EventCountEntity with lowercase status
     * - call getExistingEventCount with uppercase status
     * @expected
     * - returns null (case doesn't match)
     */
    it('should be case-sensitive', async () => {
      const scenario = existingEventCountScenarios.caseSensitive;
      await eventCountRepo.insert(scenario.eventCountRepo);

      const result = await action.getExistingEventCount(
        scenario.query.status,
        scenario.query.fromChain,
        scenario.query.toChain,
      );

      expect(result).toBe(scenario.expected);
    });
  });

  describe('upsertEventCount', () => {
    beforeEach(async () => {
      await eventCountRepo.clear();
    });

    /**
     * @target upsertEventCount should insert new event count record
     * @dependency database
     * @scenario
     * - call upsertEventCount with new data
     * - verify record was created
     * @expected
     * - new EventCountEntity record is created
     */
    it('should insert new event count record', async () => {
      const scenario = upsertEventCountScenarios.insertNew;
      await eventCountRepo.insert(scenario.initialData);

      await action.upsertEventCount(
        scenario.upsertData.status,
        scenario.upsertData.fromChain,
        scenario.upsertData.toChain,
        scenario.upsertData.eventCount,
        scenario.upsertData.maxHeight,
      );

      const allRecords = await eventCountRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await eventCountRepo.findOne({
        where: {
          status: scenario.expectedRecord.status,
          fromChain: scenario.expectedRecord.fromChain,
          toChain: scenario.expectedRecord.toChain,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.eventCount).toBe(scenario.expectedRecord.eventCount);
      expect(result?.lastProcessedHeight).toBe(
        scenario.expectedRecord.lastProcessedHeight,
      );
    });

    /**
     * @target upsertEventCount should update existing event count record
     * @dependency database
     * @scenario
     * - insert existing EventCountEntity
     * - call upsertEventCount with same composite key but different data
     * - verify record was updated
     * @expected
     * - existing EventCountEntity record is updated
     */
    it('should update existing event count record', async () => {
      const scenario = upsertEventCountScenarios.updateExisting;
      await eventCountRepo.insert(scenario.initialData);

      await action.upsertEventCount(
        scenario.upsertData.status,
        scenario.upsertData.fromChain,
        scenario.upsertData.toChain,
        scenario.upsertData.eventCount,
        scenario.upsertData.maxHeight,
      );

      const allRecords = await eventCountRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await eventCountRepo.findOne({
        where: {
          status: scenario.expectedRecord.status,
          fromChain: scenario.expectedRecord.fromChain,
          toChain: scenario.expectedRecord.toChain,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.eventCount).toBe(scenario.expectedRecord.eventCount);
      expect(result?.lastProcessedHeight).toBe(
        scenario.expectedRecord.lastProcessedHeight,
      );
    });

    /**
     * @target upsertEventCount should handle zero event count
     * @dependency database
     * @scenario
     * - call upsertEventCount with eventCount = 0
     * @expected
     * - record is created with zero count
     */
    it('should handle zero event count', async () => {
      const scenario = upsertEventCountScenarios.zeroEventCount;
      await eventCountRepo.insert(scenario.initialData);

      await action.upsertEventCount(
        scenario.upsertData.status,
        scenario.upsertData.fromChain,
        scenario.upsertData.toChain,
        scenario.upsertData.eventCount,
        scenario.upsertData.maxHeight,
      );

      const allRecords = await eventCountRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await eventCountRepo.findOne({
        where: {
          status: scenario.expectedRecord.status,
          fromChain: scenario.expectedRecord.fromChain,
          toChain: scenario.expectedRecord.toChain,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.eventCount).toBe(scenario.expectedRecord.eventCount);
    });

    /**
     * @target upsertEventCount should handle multiple updates to same key
     * @dependency database
     * @scenario
     * - call upsertEventCount multiple times with same composite key
     * @expected
     * - last update wins
     */
    it('should handle multiple updates to same key', async () => {
      const scenario = upsertEventCountScenarios.updateMultipleTimes;
      await eventCountRepo.insert(scenario.initialData);

      for (const operation of scenario.upsertOperations) {
        await action.upsertEventCount(
          operation.status,
          operation.fromChain,
          operation.toChain,
          operation.eventCount,
          operation.maxHeight,
        );
      }

      const allRecords = await eventCountRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await eventCountRepo.findOne({
        where: {
          status: scenario.expectedRecord.status,
          fromChain: scenario.expectedRecord.fromChain,
          toChain: scenario.expectedRecord.toChain,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.eventCount).toBe(scenario.expectedRecord.eventCount);
      expect(result?.lastProcessedHeight).toBe(
        scenario.expectedRecord.lastProcessedHeight,
      );
    });
  });
});
