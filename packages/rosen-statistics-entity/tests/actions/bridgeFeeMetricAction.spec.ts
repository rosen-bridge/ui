import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import { describe, it, expect, beforeEach } from 'vitest';

import {
  METRIC_KEYS,
  BridgeFeeEntity,
  MetricEntity,
  BridgeFeeMetricAction,
} from '../../lib';
import { bridgeFeeMetricActionTestData } from '../testData';
import { createDatabase } from '../utils';

describe('BridgeFeeMetricAction', () => {
  let dataSource: DataSource;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let metricRepo: Repository<MetricEntity>;
  let logger: AbstractLogger;
  let action: BridgeFeeMetricAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
    logger = new DummyLogger();

    await eventTriggerRepo.clear();
    await blockRepo.clear();
    await bridgeFeeRepo.clear();
    await metricRepo.clear();

    action = new BridgeFeeMetricAction(dataSource, logger);
  });

  describe('getLastProcessedRecord', () => {
    /**
     * @target getLastProcessedRecord should return undefined when no records exist in BridgeFeeEntity
     * @dependencies
     * - database
     * @scenario
     * - No records in BridgeFeeEntity table
     * - Call getLastProcessedRecord
     * @expected
     * - Returns undefined
     */
    it('should return undefined when no records exist in BridgeFeeEntity', async () => {
      const lastProcessedRecord = await action.getLastProcessedRecord();

      expect(lastProcessedRecord).toBeUndefined();
    });

    /**
     * @target getLastProcessedRecord should return the record with the highest lastProcessedHeight
     * @dependencies
     * - database
     * @scenario
     * - Insert multiple BridgeFeeEntity records with different lastProcessedHeight values
     * - Call getLastProcessedRecord
     * @expected
     * - Returns the record with the highest lastProcessedHeight
     */
    it('should return the record with the highest lastProcessedHeight', async () => {
      const testData =
        bridgeFeeMetricActionTestData.getLastProcessedHeightMultipleRecords;

      await bridgeFeeRepo.insert(testData.bridgeFeeRepo);

      const lastProcessedRecord = await action.getLastProcessedRecord();

      expect(lastProcessedRecord).toEqual(testData.expectedRecord);
    });
  });

  describe('getFirstEventTimestamp', () => {
    /**
     * @target getFirstEventTimestamp should return undefined when no events exist
     * @dependencies
     * - database
     * @scenario
     * - No events in database
     * - Call getFirstEventTimestamp
     * @expected
     * - Returns undefined
     */
    it('should return undefined when no events exist', async () => {
      const timestamp = await action.getFirstEventTimestamp();
      expect(timestamp).toBeUndefined();
    });

    /**
     * @target getFirstEventTimestamp should return the earliest event timestamp
     * @dependencies
     * - database
     * @scenario
     * - Insert multiple events with different timestamps
     * - Call getFirstEventTimestamp
     * @expected
     * - Returns the earliest timestamp
     */
    it('should return the earliest event timestamp', async () => {
      const testData =
        bridgeFeeMetricActionTestData.getFirstEventTimestampMultipleEvents;

      await blockRepo.insert(testData.blockRepo);
      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const timestamp = await action.getFirstEventTimestamp();
      expect(timestamp).toBe(testData.expectedTimestamp);
    });
  });

  describe('getEventsInRange', () => {
    /**
     * @target getEventsInRange should fetch bridge fee data with block timestamps and token decimals
     * @dependencies
     * - database
     * @scenario
     * - Insert blocks with timestamps and date components
     * - Insert tokens with decimals
     * - Insert successful events with spend heights in range
     * - Call getEventsInRange with startTs and endTs
     * @expected
     * - Returns events with correct bridge fee data, block metadata, and token decimals
     * - Does not include events outside timestamp range
     * - Does not include events with non-successful status
     */
    it('should fetch bridge fee data with block timestamps and token decimals', async () => {
      const testData =
        bridgeFeeMetricActionTestData.getEventsInRangeMultipleEvents;

      await blockRepo.insert(testData.blockRepo);
      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await tokenRepo.insert(testData.tokenRepo);

      const events = await action.getEventsInRange(
        testData.startTs,
        testData.endTs,
      );

      expect(events).toEqual(testData.expectedEvents);
    });

    /**
     * @target getEventsInRange should handle missing block data gracefully
     * @dependencies
     * - database
     * @scenario
     * - Insert events with spendBlock that don't exist in blockRepo
     * - Insert events with sourceChainHeight that don't have corresponding block
     * - Call getEventsInRange
     * @expected
     * - Returns events with available data
     */
    it('should handle missing block data gracefully', async () => {
      const testData =
        bridgeFeeMetricActionTestData.getEventsInRangeMissingBlocks;

      await blockRepo.insert(testData.blockRepo);
      await eventTriggerRepo.insert(testData.eventTriggerRepo);
      await tokenRepo.insert(testData.tokenRepo);

      const events = await action.getEventsInRange(
        testData.startTs,
        testData.endTs,
      );

      expect(events).toEqual(testData.expectedEvents);
    });

    /**
     * @target getEventsInRange should return empty array when no events in range
     * @dependencies
     * - database
     * @scenario
     * - Insert events with timestamps outside range
     * - Call getEventsInRange
     * @expected
     * - Returns empty array
     */
    it('should return empty array when no events in range', async () => {
      const testData = bridgeFeeMetricActionTestData.getEventsInRangeNoEvents;

      await blockRepo.insert(testData.blockRepo);
      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const events = await action.getEventsInRange(
        testData.startTs,
        testData.endTs,
      );

      expect(events).toHaveLength(0);
    });
  });

  describe('upsertBridgeFees', () => {
    /**
     * @target upsertBridgeFees should create new bridge fee records and update total metric
     * @dependencies
     * - database
     * @scenario
     * - No existing BridgeFeeEntity or MetricEntity records
     * - Call upsertBridgeFees with 2 aggregated bridge fee groups and totalCount as string
     * @expected
     * - Creates 2 BridgeFeeEntity records with correct amounts and metadata
     * - Creates MetricEntity record with TOTAL_BRIDGE_FEES_USD as string
     * - All operations succeed in same transaction
     */
    it('should create new bridge fee records and update total metric', async () => {
      const testData = bridgeFeeMetricActionTestData.upsertBridgeFeesNewGroups;

      await action.upsertBridgeFees(
        testData.aggregatedBridgeFees,
        testData.totalCount,
      );

      const bridgeFees = await bridgeFeeRepo.find({
        select: [
          'fromChain',
          'amount',
          'day',
          'week',
          'month',
          'year',
          'lastProcessedHeight',
        ],
      });

      expect(bridgeFees).toHaveLength(testData.expectedBridgeFees.length);
      expect(bridgeFees).toEqual(testData.expectedBridgeFees);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
      expect(metric?.updatedAt).toBeDefined();
    });

    /**
     * @target upsertBridgeFees should replace existing bridge fee records with new values
     * @dependencies
     * - database
     * @scenario
     * - Insert existing BridgeFeeEntity record
     * - Insert existing MetricEntity with TOTAL_BRIDGE_FEES_USD = '10'
     * - Call upsertBridgeFees with updated bridge fee data and totalCount = '15'
     * @expected
     * - Existing BridgeFeeEntity is REPLACED (not added) with new values
     * - MetricEntity is updated to '15'
     */
    it('should replace existing bridge fee records with new values', async () => {
      const testData =
        bridgeFeeMetricActionTestData.upsertBridgeFeesUpdateExisting;

      await bridgeFeeRepo.insert(testData.existingBridgeFees);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertBridgeFees(
        testData.aggregatedBridgeFees,
        testData.totalCount,
      );

      const bridgeFees = await bridgeFeeRepo.find({
        select: [
          'fromChain',
          'amount',
          'day',
          'week',
          'month',
          'year',
          'lastProcessedHeight',
        ],
      });

      expect(bridgeFees).toHaveLength(testData.expectedBridgeFees.length);
      expect(bridgeFees).toEqual(testData.expectedBridgeFees);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertBridgeFees should handle multiple groups with different dates
     * @dependencies
     * - database
     * @scenario
     * - Call upsertBridgeFees with bridge fee groups from different dates
     * @expected
     * - All groups are created correctly with their respective date components
     */
    it('should handle multiple groups with different dates', async () => {
      const testData =
        bridgeFeeMetricActionTestData.upsertBridgeFeesDifferentDates;

      await action.upsertBridgeFees(
        testData.aggregatedBridgeFees,
        testData.totalCount,
      );

      const bridgeFees = await bridgeFeeRepo.find({
        select: [
          'fromChain',
          'amount',
          'day',
          'week',
          'month',
          'year',
          'lastProcessedHeight',
        ],
      });

      expect(bridgeFees).toHaveLength(testData.expectedBridgeFees.length);
      expect(bridgeFees).toEqual(testData.expectedBridgeFees);
    });

    /**
     * @target upsertBridgeFees should update only total metric when aggregated bridge fees array is empty
     * @dependencies
     * - database
     * @scenario
     * - Insert existing BridgeFeeEntity records
     * - Insert existing MetricEntity with TOTAL_BRIDGE_FEES_USD = '10'
     * - Call upsertBridgeFees with empty aggregatedBridgeFees array and totalCount = '10'
     * @expected
     * - Existing BridgeFeeEntity records remain unchanged
     * - Total metric is updated with provided totalCount value (still '10')
     */
    it('should update only total metric when aggregated bridge fees array is empty', async () => {
      const testData = bridgeFeeMetricActionTestData.upsertBridgeFeesEmpty;

      await bridgeFeeRepo.insert(testData.existingBridgeFees);
      await metricRepo.insert(testData.existingMetric);

      await action.upsertBridgeFees(
        testData.aggregatedBridgeFees,
        testData.totalCount,
      );

      const bridgeFees = await bridgeFeeRepo.find({
        select: [
          'fromChain',
          'amount',
          'day',
          'week',
          'month',
          'year',
          'lastProcessedHeight',
        ],
      });

      expect(bridgeFees).toHaveLength(testData.expectedBridgeFees.length);
      expect(bridgeFees).toEqual(testData.expectedBridgeFees);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target upsertBridgeFees should handle decimal string values correctly
     * @dependencies
     * - database
     * @scenario
     * - Call upsertBridgeFees with decimal string amounts
     * @expected
     * - Stores decimal values as numbers in BridgeFeeEntity
     * - Stores total count as string in MetricEntity
     */
    it('should handle decimal string values correctly', async () => {
      const testData =
        bridgeFeeMetricActionTestData.upsertBridgeFeesDecimalValues;

      await action.upsertBridgeFees(
        testData.aggregatedBridgeFees,
        testData.totalCount,
      );

      const bridgeFees = await bridgeFeeRepo.find({
        select: ['fromChain', 'amount', 'lastProcessedHeight'],
      });

      expect(bridgeFees[0].amount).toBeCloseTo(testData.expectedAmount, 10);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });
  });
});
