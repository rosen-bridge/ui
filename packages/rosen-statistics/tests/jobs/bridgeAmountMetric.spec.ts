import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import {
  BridgedAmountEntity,
  METRIC_KEYS,
  MetricEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { beforeEach, describe, expect, it } from 'vitest';

import { bridgeAmountMetric } from '../../lib';
import { bridgeMetricTestData } from '../testData';
import { createDatabase } from '../utils';

describe('bridgeAmountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let bridgeAmountRepo: Repository<BridgedAmountEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    bridgeAmountRepo = dataSource.getRepository(BridgedAmountEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await bridgeAmountRepo.clear();
    await eventTriggerRepo.clear();
    await blockRepo.clear();
    await tokenRepo.clear();
    await tokenPriceRepo.clear();
  });

  /**
   * @target Should calculate bridge amount for multiple chains (first run)
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - FIRST RUN SCENARIO - No existing data in database
   * - Insert blocks, events, tokens, and token prices for multiple chains
   * - Run bridgeAmountMetric
   * @expected
   * - Creates BridgeAmountEntity records for each chain with correct amounts
   * - Updates total metric to sum of all bridge amount (58 USD)
   */
  it('should calculate bridge amount for multiple chains (first run)', async () => {
    const testData = bridgeMetricTestData.multipleChains;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );

    const actualBridgeAmount = await bridgeAmountRepo.find({
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

    expect(actualBridgeAmount).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(actualBridgeAmount).toEqual(
      testData.expectedResults.bridgeAmountRecords,
    );
  });

  /**
   * @target Should resume from last processed record
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - Insert existing bridge amount record (2.5 USD) and total metric (2.5)
   * - Insert new event after last processed record (3.0 USD)
   * - Run bridgeAmountMetric
   * @expected
   * - Creates NEW bridge amount record for Day 2 (3.0 USD)
   * - Updates total metric to 5.5 USD (2.5 + 3.0)
   */
  it('should resume from last processed record', async () => {
    const testData = bridgeMetricTestData.resumeFromLastRecord;

    await bridgeAmountRepo.insert(testData.bridgeAmountRepo);
    await metricRepo.insert(testData.metricRepo);
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );

    const actualBridgeAmount = await bridgeAmountRepo.find({
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

    expect(actualBridgeAmount).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(actualBridgeAmount).toEqual(
      testData.expectedResults.bridgeAmountRecords,
    );
  });

  /**
   * @target Should throw error when token price is missing
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - Insert events for ergo (has price) and cardano (no price)
   * - Run bridgeAmountMetric
   * @expected
   * - No metrics are saved for the day with missing price
   * - No bridge amount records are saved for the problematic day
   */
  it('should throw error when token price is missing', async () => {
    const testData = bridgeMetricTestData.missingTokenPrice;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric).toBeNull();

    const actualBridgeAmount = await bridgeAmountRepo.find();
    expect(actualBridgeAmount).toHaveLength(0);
  });

  /**
   * @target Should aggregate multiple events per chain per day
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - Insert 3 successful events for ergo on same day (2.5, 5.0, 7.5 USD)
   * - Run bridgeAmountMetric
   * @expected
   * - Total metric = 15
   * - Creates single bridge amount record with aggregated amount (15.0 USD)
   */
  it('should aggregate multiple events per chain per day', async () => {
    const testData = bridgeMetricTestData.aggregateMultipleEvents;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );

    const actualBridgeAmount = await bridgeAmountRepo.find({
      select: [
        'fromChain',
        'amount',
        'day',
        'month',
        'year',
        'lastProcessedHeight',
        'week',
      ],
    });

    expect(actualBridgeAmount).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(actualBridgeAmount).toEqual(
      testData.expectedResults.bridgeAmountRecords,
    );
  });

  /**
   * @target Should process multiple days of events
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - Insert events spanning 3 days (2.5, 6.0, 10.5 USD)
   * - Run bridgeAmountMetric
   * @expected
   * - Creates bridge amount records for each day
   * - Total metric = 19.0 USD
   */
  it('should process multiple days of events', async () => {
    const testData = bridgeMetricTestData.processMultipleDays;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );

    const actualBridgeAmount = await bridgeAmountRepo.find({
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

    expect(actualBridgeAmount).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(actualBridgeAmount).toEqual(
      testData.expectedResults.bridgeAmountRecords,
    );
  });

  /**
   * @target Should handle no events found
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * @scenario
   * - No events in database
   * - Run bridgeAmountMetric
   * @expected
   * - No bridge amount records created
   * - No metric created
   */
  it('should handle no events found', async () => {
    await bridgeAmountMetric(dataSource, logger);

    const bridgeAmount = await bridgeAmountRepo.find();
    expect(bridgeAmount).toHaveLength(0);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric).toBeNull();
  });

  /**
   * @target Should preserve existing data when no new events
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * @scenario
   * - Insert existing bridge amount record (2.5 USD) and total metric (2.5)
   * - No new events in range
   * - Run bridgeAmountMetric
   * @expected
   * - Existing data remains unchanged (2.5 USD)
   */
  it('should preserve existing data when no new events', async () => {
    const testData = bridgeMetricTestData.preserveExistingData;

    await bridgeAmountRepo.insert(testData.bridgeAmountRepo);
    await metricRepo.insert(testData.metricRepo);

    await bridgeAmountMetric(dataSource, logger);

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
    expect(bridgeAmount).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(bridgeAmount).toEqual(testData.expectedResults.bridgeAmountRecords);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );
  });

  /**
   * @target Should handle tokens with different decimals correctly
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - Insert events for tokens with different decimals (8, 6, 18, 0)
   * - Run bridgeAmountMetric
   * @expected
   * - Correctly calculates USD values with proper decimal handling
   * - Total metric = 50008.5 USD
   */
  it('should handle tokens with different decimals correctly', async () => {
    const testData = bridgeMetricTestData.differentDecimals;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );

    const actualBridgeAmount = await bridgeAmountRepo.find({
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

    expect(actualBridgeAmount).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(actualBridgeAmount).toEqual(
      testData.expectedResults.bridgeAmountRecords,
    );
  });
  /**
   * @target Should store events in different days when timestamp crosses midnight
   * @dependencies
   * - database
   * - BridgeAmountMetricAction
   * - TokenPriceAction
   * - calculateBridgeAmount
   * @scenario
   * - First event: noon of day 1
   * - Second event: midnight of day 2
   * - Run bridgeAmountMetric
   * @expected
   * - Creates TWO separate bridge amount records (one for day 1, one for day 2)
   * - Even though events are close in time, they belong to different days
   */
  it('should store events in different days when timestamp crosses midnight', async () => {
    const testData = bridgeMetricTestData.crossMidnight;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeAmountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeAmountMetricValue,
    );

    const actualBridgeAmounts = await bridgeAmountRepo.find({
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

    expect(actualBridgeAmounts).toHaveLength(
      testData.expectedResults.bridgeAmountRecords.length,
    );
    expect(actualBridgeAmounts).toEqual(
      testData.expectedResults.bridgeAmountRecords,
    );
  });
});
