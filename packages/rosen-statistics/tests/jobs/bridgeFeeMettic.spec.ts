import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  METRIC_KEYS,
  MetricEntity,
  BridgeFeeEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { bridgeFeeMetric } from '../../lib';
import { bridgeFeeJobTestData } from '../data/bridgeFee-data';
import { createDatabase } from '../utils';

describe('bridgeFeeMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let logger: DummyLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await eventTriggerRepo.clear();
    await blockRepo.clear();
    await bridgeFeeRepo.clear();
    await tokenPriceRepo.clear();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Helper function to setup and run a test scenario
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runTestScenario = async (testData: any) => {
    vi.setSystemTime(new Date(testData.systemTime));

    if (testData.blockRepo?.length) {
      await blockRepo.insert(testData.blockRepo);
    }
    if (testData.tokenPriceRepo?.length) {
      await tokenPriceRepo.insert(testData.tokenPriceRepo);
    }
    if (testData.eventTriggerRepo?.length) {
      await eventTriggerRepo.insert(testData.eventTriggerRepo);
    }
    if (testData.bridgeFeeRepo?.length) {
      await bridgeFeeRepo.insert(testData.bridgeFeeRepo);
    }
    if (testData.metricRepo?.length) {
      await metricRepo.insert(testData.metricRepo);
    }

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find({
      order: { year: 'ASC', month: 'ASC', day: 'ASC' },
    });

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });

    return { bridgeFeeRecords, metric };
  };

  /**
   * @target bridgeFeeMetric should process events from first event timestamp
   * @dependency database
   * @scenario
   * - insert blocks and events with timestamps
   * - insert token prices
   * - call bridgeFeeMetric with no previous processing
   * @expected
   * - bridge fee records created for each chain
   * - total metric updated with correct USD amount
   */
  it('should process events from first event timestamp', async () => {
    const testData = bridgeFeeJobTestData.test1;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(
      testData.expectedResults.bridgeFeeCount,
    );

    for (const expected of testData.expectedResults.bridgeFeeRecords) {
      const record = bridgeFeeRecords.find(
        (r) =>
          r.fromChain === expected.fromChain &&
          r.day === expected.day &&
          r.month === expected.month &&
          r.year === expected.year,
      );
      expect(record).not.toBeUndefined();
      expect(record?.amount).toBe(expected.amount);
      expect(record?.lastProcessedHeight).toBe(expected.lastProcessedHeight);
    }

    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
  });

  /**
   * @target bridgeFeeMetric should resume from last processed height
   * @dependency database
   * @scenario
   * - insert existing bridge fee record with lastProcessedHeight
   * - insert new events after last processed height
   * - call bridgeFeeMetric
   * @expected
   * - processes only new events after last processed height
   * - updates existing bridge fee record
   * - updates total metric with additional amount
   */
  it('should resume from last processed height', async () => {
    const testData = bridgeFeeJobTestData.test2;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(
      testData.expectedResults.bridgeFeeCount,
    );

    for (const expected of testData.expectedResults.bridgeFeeRecords) {
      const record = bridgeFeeRecords.find(
        (r) =>
          r.fromChain === expected.fromChain &&
          r.day === expected.day &&
          r.month === expected.month &&
          r.year === expected.year,
      );
      expect(record).not.toBeUndefined();
      expect(record?.amount).toBe(expected.amount);
      expect(record?.lastProcessedHeight).toBe(expected.lastProcessedHeight);
    }

    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
  });

  /**
   * @target bridgeFeeMetric should skip events without token prices
   * @dependency database
   * @scenario
   * - insert events with token IDs
   * - don't insert corresponding token prices
   * - call bridgeFeeMetric
   * @expected
   * - events without prices are skipped
   * - no bridge fee records created for skipped events
   */
  it('should skip events without token prices', async () => {
    const testData = bridgeFeeJobTestData.test3;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(
      testData.expectedResults.bridgeFeeCount,
    );

    for (const expected of testData.expectedResults.bridgeFeeRecords) {
      const record = bridgeFeeRecords.find(
        (r) =>
          r.fromChain === expected.fromChain &&
          r.day === expected.day &&
          r.month === expected.month &&
          r.year === expected.year,
      );
      expect(record).not.toBeUndefined();
      expect(record?.amount).toBe(expected.amount);
      expect(record?.lastProcessedHeight).toBe(expected.lastProcessedHeight);
    }

    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
  });

  /**
   * @target bridgeFeeMetric should aggregate multiple events per chain per day
   * @dependency database
   * @scenario
   * - insert multiple events for same chain on same day
   * - call bridgeFeeMetric
   * @expected
   * - creates single bridge fee record with aggregated amount
   * - uses highest height as lastProcessedHeight
   */
  it('should aggregate multiple events per chain per day', async () => {
    const testData = bridgeFeeJobTestData.test4;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(
      testData.expectedResults.bridgeFeeCount,
    );

    for (const expected of testData.expectedResults.bridgeFeeRecords) {
      const record = bridgeFeeRecords.find(
        (r) =>
          r.fromChain === expected.fromChain &&
          r.day === expected.day &&
          r.month === expected.month &&
          r.year === expected.year,
      );
      expect(record).not.toBeUndefined();
      expect(record?.amount).toBe(expected.amount);
      expect(record?.lastProcessedHeight).toBe(expected.lastProcessedHeight);
      if (expected.week !== undefined) {
        expect(record?.week).toBe(expected.week);
      }
    }

    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
  });

  /**
   * @target bridgeFeeMetric should process multiple days of events
   * @dependency database
   * @scenario
   * - insert events spanning multiple days
   * - call bridgeFeeMetric
   * @expected
   * - creates bridge fee records for each day
   * - aggregates per chain per day
   * - calculates correct total across all days
   */
  it('should process multiple days of events', async () => {
    const testData = bridgeFeeJobTestData.test5;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(
      testData.expectedResults.bridgeFeeCount,
    );

    for (const expected of testData.expectedResults.bridgeFeeRecords) {
      const record = bridgeFeeRecords.find(
        (r) =>
          r.fromChain === expected.fromChain &&
          r.day === expected.day &&
          r.month === expected.month &&
          r.year === expected.year,
      );
      expect(record).not.toBeUndefined();
      expect(record?.amount).toBe(expected.amount);
      expect(record?.lastProcessedHeight).toBe(expected.lastProcessedHeight);
    }

    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
  });

  /**
   * @target bridgeFeeMetric should handle edge case when last block not found
   * @dependency database
   * @scenario
   * - insert bridge fee record with lastProcessedHeight
   * - don't insert corresponding block
   * - call bridgeFeeMetric
   * @expected
   * - starts processing from current time
   * - doesn't crash
   */
  it('should handle edge case when last block not found', async () => {
    const testData = bridgeFeeJobTestData.test6;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(
      testData.expectedResults.bridgeFeeCount,
    );

    for (const expected of testData.expectedResults.bridgeFeeRecords) {
      const record = bridgeFeeRecords.find(
        (r) =>
          r.fromChain === expected.fromChain &&
          r.day === expected.day &&
          r.month === expected.month &&
          r.year === expected.year,
      );
      expect(record).not.toBeUndefined();
      expect(record?.amount).toBe(expected.amount);
      expect(record?.lastProcessedHeight).toBe(expected.lastProcessedHeight);
    }

    if (testData.expectedResults.totalMetricValue === null) {
      expect(metric).toBeNull();
    } else {
      expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);
    }
  });

  /**
   * @target bridgeFeeMetric should ignore non-successful events
   * @dependency database
   * @scenario
   * - insert pending and successful events
   * - call bridgeFeeMetric
   * @expected
   * - only successful events are processed
   * - pending events are ignored
   */
  it('should ignore non-successful events', async () => {
    const testData = bridgeFeeJobTestData.test1;
    const { bridgeFeeRecords, metric } = await runTestScenario(testData);

    expect(bridgeFeeRecords).toHaveLength(2);

    const ergoRecords = bridgeFeeRecords.filter((r) => r.fromChain === 'ergo');
    expect(ergoRecords).toHaveLength(1);
    expect(ergoRecords[0].amount).toBe(25);

    expect(metric?.value).toBe('70');
  });

  /**
   * @target bridgeFeeMetric should handle empty database
   * @dependency database
   * @scenario
   * - don't insert any data
   * - call bridgeFeeMetric
   * @expected
   * - function returns without error
   * - no bridge fee records created
   * - no metric created
   */
  it('should handle empty database', async () => {
    vi.setSystemTime(new Date('2024-01-20T00:00:00Z'));

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find();
    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });

    expect(bridgeFeeRecords).toHaveLength(0);
    expect(metric).toBeNull();
  });

  /**
   * @target bridgeFeeMetric should use latest token price
   * @dependency database
   * @scenario
   * - insert multiple token prices at different timestamps
   * - insert event using that token
   * - call bridgeFeeMetric
   * @expected
   * - uses the latest price before event timestamp
   */
  it('should use latest token price', async () => {
    vi.setSystemTime(new Date('2024-01-20T00:00:00Z'));

    await blockRepo.insert([bridgeFeeJobTestData.test1.blockRepo[0]]);

    await tokenPriceRepo.insert([
      { tokenId: 'token1', price: 2.0, timestamp: 1705622200 },
      { tokenId: 'token1', price: 2.5, timestamp: 1705622300 },
      { tokenId: 'token1', price: 3.0, timestamp: 1705622500 },
    ]);

    await eventTriggerRepo.insert([
      bridgeFeeJobTestData.test1.eventTriggerRepo[0],
    ]);

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find();
    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });

    expect(bridgeFeeRecords).toHaveLength(1);

    const expectedAmount = 10 * 2.5;
    expect(bridgeFeeRecords[0].amount).toBe(expectedAmount);
    expect(metric?.value).toBe(expectedAmount.toString());
  });
});
