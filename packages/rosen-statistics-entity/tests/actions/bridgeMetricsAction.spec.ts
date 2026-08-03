import { beforeEach, describe, expect, it } from 'vitest';

import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';

import {
  BridgedAmountEntity,
  BridgeFeeEntity,
  BridgeMetricsAction,
  METRIC_KEYS,
  MetricEntity,
} from '../../lib';
import { bridgeMetricsActionTestData } from '../testData';
import { createDatabase } from '../utils';

describe('BridgeMetricsAction', () => {
  let dataSource: DataSource;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;
  let bridgeAmountRepo: Repository<BridgedAmountEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let metricRepo: Repository<MetricEntity>;
  let logger: AbstractLogger;
  let action: BridgeMetricsAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    bridgeAmountRepo = dataSource.getRepository(BridgedAmountEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
    metricRepo = dataSource.getRepository(MetricEntity);
    logger = new DummyLogger();

    await eventTriggerRepo.clear();
    await blockRepo.clear();
    await bridgeFeeRepo.clear();
    await bridgeAmountRepo.clear();
    await metricRepo.clear();

    action = new BridgeMetricsAction(dataSource, logger);
  });

  describe('getLastBridgeFeeRecord', () => {
    /**
     * @target getLastBridgeFeeRecord should return undefined when no records exist in BridgeFeeEntity
     * @dependencies
     * - database
     * @scenario
     * - No records in BridgeFeeEntity table
     * - Call getLastBridgeFeeRecord
     * @expected
     * - Returns undefined
     */
    it('should return undefined when no records exist in BridgeFeeEntity', async () => {
      const lastProcessedRecord = await action.getLastBridgeFeeRecord();

      expect(lastProcessedRecord).toBeUndefined();
    });

    /**
     * @target getLastBridgeFeeRecord should return the record with the highest lastProcessedHeight
     * @dependencies
     * - database
     * @scenario
     * - Insert multiple BridgeFeeEntity records with different lastProcessedHeight values
     * - Call getLastBridgeFeeRecord
     * @expected
     * - Returns the record with the highest lastProcessedHeight
     */
    it('should return the record with the highest lastProcessedHeight', async () => {
      const testData =
        bridgeMetricsActionTestData.getLastProcessedHeightMultipleRecords;

      await bridgeFeeRepo.insert(testData.bridgeFeeRepo);

      const lastProcessedRecord = await action.getLastBridgeFeeRecord();

      expect(lastProcessedRecord).toEqual(testData.expectedRecord);
    });
  });

  describe('getLastBridgeAmountRecord', () => {
    /**
     * @target getLastBridgeAmountRecord should return undefined when no records exist in BridgeAmountEntity
     * @dependencies
     * - database
     * @scenario
     * - No records in BridgeAmountEntity table
     * - Call getLastBridgeAmountRecord
     * @expected
     * - Returns undefined
     */
    it('should return undefined when no records exist in BridgeAmountEntity', async () => {
      const lastProcessedRecord = await action.getLastBridgeAmountRecord();

      expect(lastProcessedRecord).toBeUndefined();
    });

    /**
     * @target getLastBridgeAmountRecord should return the record with the highest lastProcessedHeight
     * @dependencies
     * - database
     * @scenario
     * - Insert multiple BridgeAmountEntity records with different lastProcessedHeight values
     * - Call getLastBridgeAmountRecord
     * @expected
     * - Returns the record with the highest lastProcessedHeight
     */
    it('should return the record with the highest lastProcessedHeight', async () => {
      const testData =
        bridgeMetricsActionTestData.getLastBridgeAmountWithMultipleRecords;

      await bridgeAmountRepo.insert(testData.bridgeAmountRepo);

      const lastProcessedRecord = await action.getLastBridgeAmountRecord();

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
        bridgeMetricsActionTestData.getFirstEventTimestampMultipleEvents;

      await blockRepo.insert(testData.blockRepo);
      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const timestamp = await action.getFirstEventTimestamp();
      expect(timestamp).toBe(testData.expectedTimestamp);
    });
  });

  describe('getEventsInRange', () => {
    /**
     * @target getEventsInRange should fetch bridge amount and bridge fee with block timestamps and token decimals
     * @dependencies
     * - database
     * @scenario
     * - Insert blocks with timestamps and date components
     * - Insert tokens with decimals
     * - Insert successful events with spend heights in range
     * - Call getEventsInRange with startTs and endTs
     * @expected
     * - Returns events with correct bridge data, block metadata, and token decimals
     * - Does not include events outside timestamp range
     * - Does not include events with non-successful status
     */
    it('should fetch bridge amount and bridge fee with block timestamps and token decimals', async () => {
      const testData =
        bridgeMetricsActionTestData.getEventsInRangeMultipleEvents;

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
        bridgeMetricsActionTestData.getEventsInRangeMissingBlocks;

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
      const testData = bridgeMetricsActionTestData.getEventsInRangeNoEvents;

      await blockRepo.insert(testData.blockRepo);
      await eventTriggerRepo.insert(testData.eventTriggerRepo);

      const events = await action.getEventsInRange(
        testData.startTs,
        testData.endTs,
      );

      expect(events).toHaveLength(0);
    });
  });

  describe('saveBridgeFees', () => {
    /**
     * @target saveBridgeFees should create new bridge fee records and update total metric
     * @dependencies
     * - database
     * @scenario
     * - No existing BridgeFeeEntity or MetricEntity records
     * - Call saveBridgeFees with 2 aggregated bridge fee groups and totalCount as string
     * @expected
     * - Creates 2 BridgeFeeEntity records with correct amounts and metadata
     * - Creates MetricEntity record with TOTAL_BRIDGE_FEES_USD as string
     * - All operations succeed in same transaction
     */
    it('should create new bridge fee records and update total metric', async () => {
      const testData = bridgeMetricsActionTestData.saveBridgeFeesNewGroups;

      await action.saveBridgeFees(
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
     * @target saveBridgeFees should replace existing total bridge fee records with new values
     * @dependencies
     * - database
     * @scenario
     * - Insert existing BridgeFeeEntity record
     * - Insert existing MetricEntity with TOTAL_BRIDGE_FEES_USD = '10'
     * - Call saveBridgeFees with updated bridge fee data and totalCount = '15'
     * @expected
     * - Creates a new BridgeFeeEntity records with correct amounts and metadata
     * - MetricEntity is updated to '15'
     */
    it('should replace existing bridge fee records with new values', async () => {
      const testData = bridgeMetricsActionTestData.saveBridgeFeesUpdateExisting;

      await bridgeFeeRepo.insert(testData.existingBridgeFees);
      await metricRepo.insert(testData.existingMetric);

      await action.saveBridgeFees(
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
     * @target saveBridgeFees should handle multiple groups with different dates
     * @dependencies
     * - database
     * @scenario
     * - Call saveBridgeFees with bridge fee groups from different dates
     * @expected
     * - All groups are created correctly with their respective date components
     */
    it('should handle multiple groups with different dates', async () => {
      const testData = bridgeMetricsActionTestData.saveBridgeFeesDifferentDates;

      await action.saveBridgeFees(
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
  });

  describe('saveBridgeAmount', () => {
    /**
     * @target saveBridgeAmount should create new bridge amount records and update total metric
     * @dependencies
     * - database
     * @scenario
     * - No existing BridgeAmountEntity or MetricEntity records
     * - Call saveBridgeFees with 2 aggregated bridge amount groups and totalCount as string
     * @expected
     * - Creates 2 BridgeAmountEntity records with correct amounts and metadata
     * - Creates MetricEntity record with TOTAL_BRIDGE_AMOUNT_USD as string
     * - All operations succeed in same transaction
     */
    it('should create new bridge amount records and update total metric', async () => {
      const testData = bridgeMetricsActionTestData.saveBridgeAmountNewGroups;

      await action.saveBridgeAmount(
        testData.aggregatedBridgeAmount,
        testData.totalCount,
      );

      const bridgeAmount = await bridgeAmountRepo.find({
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

      expect(bridgeAmount).toHaveLength(testData.expectedBridgeAmount.length);
      expect(bridgeAmount).toEqual(testData.expectedBridgeAmount);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
      expect(metric?.updatedAt).toBeDefined();
    });

    /**
     * @target saveBridgeAmount should replace existing total bridge amount records with new values
     * @dependencies
     * - database
     * @scenario
     * - Insert existing BridgeAmountEntity record
     * - Insert existing MetricEntity with TOTAL_BRIDGE_AMOUNT_USD = '10'
     * - Call saveBridgeAMount with updated bridge amount data and totalCount = '25.25'
     * @expected
     * - Creates a new BridgeAmountEntity records with correct amounts and metadata
     * - MetricEntity is updated to '25.25'
     */
    it('should replace existing bridge amount records with new values', async () => {
      const testData =
        bridgeMetricsActionTestData.saveBridgeAmountUpdateExisting;

      await bridgeAmountRepo.insert(testData.existingBridgeAmount);
      await metricRepo.insert(testData.existingMetric);

      await action.saveBridgeAmount(
        testData.aggregatedBridgeAmount,
        testData.totalCount,
      );

      const bridgeAmount = await bridgeAmountRepo.find({
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

      expect(bridgeAmount).toHaveLength(testData.expectedBridgeAmount.length);
      expect(bridgeAmount).toEqual(testData.expectedBridgeAmount);

      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
      });
      expect(metric?.value).toBe(testData.expectedMetricValue);
    });

    /**
     * @target saveBridgeAmount should handle multiple groups with different dates
     * @dependencies
     * - database
     * @scenario
     * - Call saveBridgeAmount with bridge amount groups from different dates
     * @expected
     * - All groups are created correctly with their respective date components
     */
    it('should handle multiple groups with different dates', async () => {
      const testData =
        bridgeMetricsActionTestData.saveBridgeAmountDifferentDates;

      await action.saveBridgeAmount(
        testData.aggregatedBridgeAmount,
        testData.totalCount,
      );

      const bridgeAmount = await bridgeAmountRepo.find({
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

      expect(bridgeAmount).toHaveLength(testData.expectedBridgeAmount.length);
      expect(bridgeAmount).toEqual(testData.expectedBridgeAmount);
    });
  });
});
