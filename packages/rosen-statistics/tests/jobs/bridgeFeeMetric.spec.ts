import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import {
  METRIC_KEYS,
  MetricEntity,
  BridgeFeeEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { bridgeFeeMetric } from '../../lib';
import { bridgeFeeMetricTestData } from '../testData';
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

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * @target Should calculate bridge fees for multiple chains
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert blocks, events, tokens, and token prices for multiple chains
   * - Set system time to Jan 3, 2024 (day after last event)
   * - Run bridgeFeeMetric
   * @expected
   * - Creates BridgeFeeEntity records for each chain with correct amounts
   * - Updates total metric to sum of all bridge fees (6.00025 USD)
   */
  it('should calculate bridge fees for multiple chains', async () => {
    const testData = bridgeFeeMetricTestData.multipleChains;

    // Set system time to Jan 3, 2024 (day after last event)
    vi.setSystemTime(new Date('2024-01-03T00:00:00Z'));
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

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
   * - Set system time to Jan 4, 2024
   * - Run bridgeFeeMetric
   * @expected
   * - Updates existing bridge fee record to 5.5 USD
   * - Updates total metric to 5.5
   */
  it('should resume from last processed record', async () => {
    const testData = bridgeFeeMetricTestData.resumeFromLastRecord;

    vi.setSystemTime(new Date('2024-01-04T00:00:00Z'));
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
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

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
   * @target Should skip events without token prices
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert events for ergo (has price) and cardano (no price)
   * - Set system time to Jan 3, 2024
   * - Run bridgeFeeMetric
   * @expected
   * - Only ergo event is processed (2.5 USD)
   * - Cardano event is skipped
   * - Total metric = 2.5
   */
  it('should skip events without token prices', async () => {
    const testData = bridgeFeeMetricTestData.skipEventsWithoutPrices;

    vi.setSystemTime(new Date('2024-01-03T00:00:00Z'));
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

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
   * @target Should aggregate multiple events per chain per day
   * @dependencies
   * - database
   * - BridgeFeeMetricAction
   * - TokenPriceAction
   * - calculateBridgeFees
   * @scenario
   * - Insert 3 successful events for ergo on same day (2.5, 5.0, 7.5 USD)
   * - Set system time to Jan 3, 2024 (day after event)
   * - Run bridgeFeeMetric
   * @expected
   * - Creates single bridge fee record with aggregated amount (15.0 USD)
   * - Uses highest height as lastProcessedHeight (300)
   */
  it('should aggregate multiple events per chain per day', async () => {
    const testData = bridgeFeeMetricTestData.aggregateMultipleEvents;

    vi.setSystemTime(new Date('2024-01-03T00:00:00Z'));
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

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
   * - Set system time to Jan 5, 2024 (day after last event)
   * - Run bridgeFeeMetric
   * @expected
   * - Creates bridge fee records for each day
   * - Total metric = 19.0 USD
   */
  it('should process multiple days of events', async () => {
    const testData = bridgeFeeMetricTestData.processMultipleDays;

    vi.setSystemTime(new Date('2024-01-05T00:00:00Z'));
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

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
   * - Set system time to Jan 20, 2024
   * - Run bridgeFeeMetric
   * @expected
   * - No bridge fee records created
   * - No metric created
   */
  it('should handle no events found', async () => {
    vi.setSystemTime(new Date('2024-01-20T00:00:00Z'));
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
   * - Set system time to Jan 3, 2024 (day after existing event)
   * - Run bridgeFeeMetric
   * @expected
   * - Existing data remains unchanged (2.5 USD)
   */
  it('should preserve existing data when no new events', async () => {
    const testData = bridgeFeeMetricTestData.preserveExistingData;

    vi.setSystemTime(new Date('2024-01-03T00:00:00Z'));
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
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
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
   * - Set system time to Jan 3, 2024 (day after event)
   * - Run bridgeFeeMetric
   * @expected
   * - Correctly calculates USD values with proper decimal handling
   * - Total metric = 50008.5 USD
   */
  it('should handle tokens with different decimals correctly', async () => {
    const testData = bridgeFeeMetricTestData.differentDecimals;

    vi.setSystemTime(new Date('2024-01-03T00:00:00Z'));
    await blockRepo.insert(testData.blockRepo);
    await tokenRepo.insert(testData.tokenRepo);
    await tokenPriceRepo.insert(testData.tokenPriceRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await bridgeFeeMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

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
