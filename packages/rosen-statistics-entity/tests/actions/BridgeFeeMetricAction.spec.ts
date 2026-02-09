import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import { BridgeFeeMetricAction } from '../../lib/actions/BridgeFeeMetricAction';
import { BridgeFeeEntity } from '../../lib/entities';
import {
  getLastProcessedHeightScenarios,
  getFirstEventTimestampScenarios,
  getBlockByHeightScenarios,
  getEventsInRangeScenarios,
  upsertBridgeFeeScenarios,
} from '../test-data/bridgeFee-data';
import { createDatabase } from '../utils';

describe('BridgeFeeMetricAction', () => {
  let dataSource: DataSource;
  let action: BridgeFeeMetricAction;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new BridgeFeeMetricAction(dataSource);

    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
  });

  describe('getLastProcessedHeight', () => {
    beforeEach(async () => {
      await bridgeFeeRepo.clear();
    });

    /**
     * @target getLastProcessedHeight should return undefined when no bridge fee records exist
     * @dependency database
     * @scenario
     * - ensure no BridgeFeeEntity records exist
     * - call getLastProcessedHeight
     * @expected
     * - returns undefined
     */
    it('should return undefined when no bridge fee records exist', async () => {
      const scenario = getLastProcessedHeightScenarios.empty;

      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getLastProcessedHeight should return highest lastProcessedHeight
     * @dependency database
     * @scenario
     * - insert BridgeFeeEntity records with different lastProcessedHeights
     * - call getLastProcessedHeight
     * @expected
     * - returns the highest lastProcessedHeight
     */
    it('should return the highest lastProcessedHeight', async () => {
      const scenario = getLastProcessedHeightScenarios.multipleRecords;

      await bridgeFeeRepo.insert(scenario.bridgeFeeRepo);

      const result = await action.getLastProcessedHeight();
      expect(result).toBe(scenario.expected);
    });
  });

  describe('getFirstEventTimestamp', () => {
    beforeEach(async () => {
      await eventTriggerRepo.clear();
      await blockRepo.clear();
    });

    /**
     * @target getFirstEventTimestamp should return undefined when no events exist
     * @dependency database
     * @scenario
     * - ensure no EventTriggerEntity records exist
     * - call getFirstEventTimestamp
     * @expected
     * - returns undefined
     */
    it('should return undefined when no events exist', async () => {
      const scenario = getFirstEventTimestampScenarios.empty;

      const result = await action.getFirstEventTimestamp();
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getFirstEventTimestamp should return earliest event timestamp
     * @dependency database
     * @scenario
     * - insert BlockEntity records
     * - insert EventTriggerEntity records with different spendBlocks
     * - call getFirstEventTimestamp
     * @expected
     * - returns the earliest block timestamp
     */
    it('should return the earliest event timestamp', async () => {
      const scenario = getFirstEventTimestampScenarios.earliestEvent;

      await blockRepo.insert(scenario.blockRepo);
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const result = await action.getFirstEventTimestamp();
      expect(result).toBe(scenario.expected);
    });
  });

  describe('getBlockByHeight', () => {
    beforeEach(async () => {
      await blockRepo.clear();
    });

    /**
     * @target getBlockByHeight should return block for given height
     * @dependency database
     * @scenario
     * - insert BlockEntity record
     * - call getBlockByHeight with existing height
     * @expected
     * - returns the matching BlockEntity
     */
    it('should return block for given height', async () => {
      const scenario = getBlockByHeightScenarios.found;

      await blockRepo.insert(scenario.blockRepo);

      const result = await action.getBlockByHeight(scenario.height);
      expect(result).not.toBeNull();
      expect(result?.height).toBe(scenario.height);
      expect(result?.scanner).toBe('ergo');
    });

    /**
     * @target getBlockByHeight should return null for non-existent height
     * @dependency database
     * @scenario
     * - call getBlockByHeight with non-existent height
     * @expected
     * - returns null
     */
    it('should return null for non-existent height', async () => {
      const scenario = getBlockByHeightScenarios.notFound;

      const result = await action.getBlockByHeight(scenario.height);
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getBlockByHeight should return correct block when multiple blocks exist
     * @dependency database
     * @scenario
     * - insert multiple BlockEntity records
     * - call getBlockByHeight with specific height
     * @expected
     * - returns the correct BlockEntity
     */
    it('should return correct block when multiple blocks exist', async () => {
      const scenario = getBlockByHeightScenarios.multipleBlocks;

      await blockRepo.insert(scenario.blockRepo);

      const result = await action.getBlockByHeight(scenario.height);
      expect(result).not.toBeNull();
      expect(result?.hash).toBe(scenario.expected?.hash);
      expect(result?.height).toBe(scenario.height);
    });

    /**
     * @target getBlockByHeight should only return ergo scanner blocks
     * @dependency database
     * @scenario
     * - insert BlockEntity records with different scanners
     * - call getBlockByHeight
     * @expected
     * - returns only blocks with 'ergo' scanner
     */
    it('should only return ergo scanner blocks', async () => {
      const scenario = getBlockByHeightScenarios.ergoScannerOnly;

      await blockRepo.insert(scenario.blockRepo);

      const result = await action.getBlockByHeight(scenario.height);
      expect(result).not.toBeNull();
      expect(result?.scanner).toBe('ergo');
      expect(result?.hash).toBe(scenario.expected?.hash);
    });
  });

  describe('getEventsInRange', () => {
    beforeEach(async () => {
      await eventTriggerRepo.clear();
      await blockRepo.clear();
    });

    /**
     * @target getEventsInRange should return successful events within timestamp range
     * @dependency database
     * @scenario
     * - insert BlockEntity records
     * - insert EventTriggerEntity records with different timestamps and statuses
     * - call getEventsInRange with specific range
     * @expected
     * - returns only successful events within the timestamp range
     */
    it('should return successful events within timestamp range', async () => {
      const scenario = getEventsInRangeScenarios.successfulEventsInRange;

      await blockRepo.insert(scenario.blockRepo);
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const events = await action.getEventsInRange(
        scenario.startTs,
        scenario.endTs,
      );

      expect(events).toHaveLength(scenario.expectedCount);
      if (scenario.expectedEvent) {
        expect(events[0].bridgeFee).toBe(scenario.expectedEvent.bridgeFee);
        expect(events[0].fromChain).toBe(scenario.expectedEvent.fromChain);
      }
    });

    /**
     * @target getEventsInRange should return empty array when no events in range
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records outside timestamp range
     * - call getEventsInRange with different range
     * @expected
     * - returns empty array
     */
    it('should return empty array when no events in range', async () => {
      const scenario = getEventsInRangeScenarios.noEvents;

      await blockRepo.insert(scenario.blockRepo);
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const events = await action.getEventsInRange(
        scenario.startTs,
        scenario.endTs,
      );
      expect(events).toHaveLength(scenario.expectedCount);
    });

    /**
     * @target getEventsInRange should return multiple events when they exist in range
     * @dependency database
     * @scenario
     * - insert multiple EventTriggerEntity records within timestamp range
     * - call getEventsInRange
     * @expected
     * - returns all events within the range
     */
    it('should return multiple events when they exist in range', async () => {
      const scenario = getEventsInRangeScenarios.multipleEvents;

      await blockRepo.insert(scenario.blockRepo);
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const events = await action.getEventsInRange(
        scenario.startTs,
        scenario.endTs,
      );
      expect(events).toHaveLength(scenario.expectedCount);
    });

    /**
     * @target getEventsInRange should exclude non-successful events
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records with different result statuses
     * - call getEventsInRange
     * @expected
     * - returns only events with result = 'successful'
     */
    it('should exclude non-successful events', async () => {
      const scenario = getEventsInRangeScenarios.excludeNonSuccessful;

      await blockRepo.insert(scenario.blockRepo);
      await eventTriggerRepo.insert(scenario.eventTriggerRepo);

      const events = await action.getEventsInRange(
        scenario.startTs,
        scenario.endTs,
      );
      expect(events).toHaveLength(scenario.expectedCount);
    });
  });

  describe('upsertBridgeFee', () => {
    beforeEach(async () => {
      await bridgeFeeRepo.clear();
    });

    /**
     * @target upsertBridgeFee should insert new bridge fee record
     * @dependency database
     * @scenario
     * - call upsertBridgeFee with new data
     * - verify record was created
     * @expected
     * - new BridgeFeeEntity record is created
     */
    it('should insert new bridge fee record', async () => {
      const scenario = upsertBridgeFeeScenarios.insertNew;

      await action.upsertBridgeFee(scenario.upsertData);

      const result = await bridgeFeeRepo.findOne({
        where: {
          fromChain: scenario.upsertData.fromChain,
          day: scenario.upsertData.day,
          month: scenario.upsertData.month,
          year: scenario.upsertData.year,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(scenario.upsertData.amount);
      expect(result?.lastProcessedHeight).toBe(
        scenario.upsertData.lastProcessedHeight,
      );
    });

    /**
     * @target upsertBridgeFee should update existing bridge fee record
     * @dependency database
     * @scenario
     * - insert existing BridgeFeeEntity
     * - call upsertBridgeFee with same composite key but different amount
     * - verify record was updated
     * @expected
     * - existing BridgeFeeEntity record is updated
     */
    it('should update existing bridge fee record', async () => {
      const scenario = upsertBridgeFeeScenarios.updateExisting;

      await bridgeFeeRepo.insert(scenario.initialData);

      await action.upsertBridgeFee(scenario.upsertData);

      const allRecords = await bridgeFeeRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await bridgeFeeRepo.findOne({
        where: {
          fromChain: scenario.upsertData.fromChain,
          day: scenario.upsertData.day,
          month: scenario.upsertData.month,
          year: scenario.upsertData.year,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(scenario.upsertData.amount);
      expect(result?.lastProcessedHeight).toBe(
        scenario.upsertData.lastProcessedHeight,
      );
    });

    /**
     * @target upsertBridgeFee should handle multiple upserts correctly
     * @dependency database
     * @scenario
     * - call upsertBridgeFee multiple times with different data
     * - verify all records are properly managed
     * @expected
     * - all BridgeFeeEntity records are correctly inserted/updated
     */
    it('should handle multiple upserts correctly', async () => {
      const scenario = upsertBridgeFeeScenarios.multipleUpserts;

      for (const data of scenario.upsertOperations) {
        await action.upsertBridgeFee(data);
      }

      const allRecords = await bridgeFeeRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      if (scenario.expectedRecords) {
        for (const expectedRecord of scenario.expectedRecords) {
          const record = allRecords.find(
            (r) =>
              r.fromChain === expectedRecord.fromChain &&
              r.day === expectedRecord.day &&
              r.month === expectedRecord.month &&
              r.year === expectedRecord.year,
          );
          expect(record).not.toBeUndefined();
          expect(record?.amount).toBe(expectedRecord.amount);
        }
      }
    });
  });
});
