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
  BridgeFeeEntity,
  METRIC_KEYS,
  MetricEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { beforeEach, describe, expect, it } from 'vitest';

import { bridgeFeeMetric } from '../../lib';
import { bridgeMetricTestData } from '../testData';
import { createDatabase } from '../utils';

describe('bridgeFeeMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let logger: AbstractLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await bridgeFeeRepo.clear();
    await eventTriggerRepo.clear();
    await blockRepo.clear();
    await tokenRepo.clear();
    await tokenPriceRepo.clear();
  });

  /**
   * @target Should calculate bridge fees for multiple chains (first run)
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - FIRST RUN SCENARIO - No existing data in database
   * - Insert blocks, events, tokens, and token prices for multiple chains
   * - Run bridgeFeeMetric
   * @expected
   * - Creates BridgeFeeEntity records for each chain with correct amounts
   * - Updates total metric to sum of all bridge fees (6.00025 USD)
   */
  it('should calculate bridge fees for multiple chains (first run)', async () => {
    const testData = bridgeMetricTestData.multipleChains;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );

    const actualBridgeFees = await bridgeFeeRepo.find({
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

    expect(actualBridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(actualBridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);
  });

  /**
   * @target Should resume from last processed record
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert existing bridge fee record (2.5 USD) and total metric (2.5)
   * - Insert new event after last processed record (3.0 USD)
   * - Run bridgeFeeMetric
   * @expected
   * - Creates NEW bridge fee record for Day 2 (3.0 USD)
   * - Updates total metric to 5.5 USD (2.5 + 3.0)
   */
  it('should resume from last processed record', async () => {
    const testData = bridgeMetricTestData.resumeFromLastRecord;

    await bridgeFeeRepo.insert(testData.bridgeFeeRepo);
    await metricRepo.insert(testData.metricRepo);
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );

    const actualBridgeFees = await bridgeFeeRepo.find({
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

    expect(actualBridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(actualBridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);
  });

  /**
   * @target Should throw error when token price is missing
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert events for ergo (has price) and cardano (no price)
   * - Run bridgeFeeMetric
   * @expected
   * - No metrics are saved for the day with missing price
   * - No bridge fee records are saved for the problematic day
   */
  it('should throw error when token price is missing', async () => {
    const testData = bridgeMetricTestData.missingTokenPrice;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric).toBeNull();

    const actualBridgeFees = await bridgeFeeRepo.find();
    expect(actualBridgeFees).toHaveLength(0);
  });

  /**
   * @target Should aggregate multiple events per chain per day
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert 3 successful events for ergo on same day (2.5, 5.0, 7.5 USD)
   * - Run bridgeFeeMetric
   * @expected
   * - Total metric = 15
   * - Creates single bridge fee record with aggregated amount (15.0 USD)
   */
  it('should aggregate multiple events per chain per day', async () => {
    const testData = bridgeMetricTestData.aggregateMultipleEvents;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );

    const actualBridgeFees = await bridgeFeeRepo.find({
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

    expect(actualBridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(actualBridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);
  });

  /**
   * @target Should process multiple days of events
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert events spanning 3 days (2.5, 6.0, 10.5 USD)
   * - Run bridgeFeeMetric
   * @expected
   * - Creates bridge fee records for each day
   * - Total metric = 19.0 USD
   */
  it('should process multiple days of events', async () => {
    const testData = bridgeMetricTestData.processMultipleDays;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );

    const actualBridgeFees = await bridgeFeeRepo.find({
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

    expect(actualBridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(actualBridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);
  });

  /**
   * @target Should handle no events found
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * @scenario
   * - No events in database
   * - Run bridgeFeeMetric
   * @expected
   * - No bridge fee records created
   * - No metric created
   */
  it('should handle no events found', async () => {
    await bridgeFeeMetric(dataSource, logger);

    const bridgeFees = await bridgeFeeRepo.find();
    expect(bridgeFees).toHaveLength(0);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric).toBeNull();
  });

  /**
   * @target Should preserve existing data when no new events
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * @scenario
   * - Insert existing bridge fee record (2.5 USD) and total metric (2.5)
   * - No new events in range
   * - Run bridgeFeeMetric
   * @expected
   * - Existing data remains unchanged (2.5 USD)
   */
  it('should preserve existing data when no new events', async () => {
    const testData = bridgeMetricTestData.preserveExistingData;

    await bridgeFeeRepo.insert(testData.bridgeFeeRepo);
    await metricRepo.insert(testData.metricRepo);

    await bridgeFeeMetric(dataSource, logger);

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
    expect(bridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(bridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );
  });

  /**
   * @target Should handle tokens with different decimals correctly
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert events for tokens with different decimals (8, 6, 18, 0)
   * - Run bridgeFeeMetric
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

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );

    const actualBridgeFees = await bridgeFeeRepo.find({
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

    expect(actualBridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(actualBridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);
  });

  /**
   * @target Should store events in different days when timestamp crosses midnight
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - First event: noon of day 1
   * - Second event: midnight of day 2
   * - Run bridgeFeeMetric
   * @expected
   * - Creates TWO separate bridge fee records (one for day 1, one for day 2)
   * - Even though events are close in time, they belong to different days
   */
  it('should store events in different days when timestamp crosses midnight', async () => {
    const testData = bridgeMetricTestData.crossMidnight;

    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(
      testData.expectedResults.totalBridgeFeeMetricValue,
    );

    const actualBridgeFees = await bridgeFeeRepo.find({
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

    expect(actualBridgeFees).toHaveLength(
      testData.expectedResults.bridgeFeeRecords.length,
    );
    expect(actualBridgeFees).toEqual(testData.expectedResults.bridgeFeeRecords);
  });
});
