// tests/jobs/eventCountMetric.spec.ts
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  METRIC_KEYS,
  MetricEntity,
  EventCountEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { eventCountMetric } from '../../lib';
import { eventCountTestData } from '../data/test-data';
import { createDatabase } from '../utils';

describe('eventCountMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let eventCountRepo: Repository<EventCountEntity>;
  let logger: DummyLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
    logger = new DummyLogger();

    await metricRepo.clear();
    await eventTriggerRepo.clear();
    await eventCountRepo.clear();
  });

  /**
   * @target eventCountMetric should calculate and store event counts for multiple groups
   * @dependency database
   * @scenario
   * - insert EventTriggerEntity records with different statuses and chains
   * - call eventCountMetric
   * @expected
   * - EventCountEntity rows are created for each unique group
   * - total metric EVENT_COUNT_TOTAL is updated with correct value
   */
  it('should calculate and store event counts for multiple groups', async () => {
    const testData = eventCountTestData.test1;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.eventCounts) {
      const countRecord = await eventCountRepo.findOne({
        where: {
          status: expected.status,
          fromChain: expected.fromChain,
          toChain: expected.toChain,
        },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.eventCount).toBe(expected.count);
    }

    const allCounts = await eventCountRepo.find();
    expect(allCounts).toHaveLength(testData.expectedResults.eventCounts.length);
  });

  /**
   * @target eventCountMetric should handle no new events gracefully
   * @dependency database
   * @scenario
   * - insert existing EventCountEntity and metric records
   * - don't insert new events
   * - call eventCountMetric
   * @expected
   * - existing records remain unchanged
   * - metric value stays the same
   */
  it('should handle no new events gracefully', async () => {
    const testData = eventCountTestData.test2;

    await eventCountRepo.insert(testData.eventCountRepo);
    await metricRepo.insert(testData.metricRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.eventCountRepo) {
      const countRecord = await eventCountRepo.findOne({
        where: {
          status: expected.status,
          fromChain: expected.fromChain,
          toChain: expected.toChain,
        },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.eventCount).toBe(expected.eventCount);
    }
  });

  /**
   * @target eventCountMetric should aggregate multiple events for same group
   * @dependency database
   * @scenario
   * - insert multiple EventTriggerEntity records for same (status, fromChain, toChain)
   * - call eventCountMetric
   * @expected
   * - single EventCountEntity created with aggregated count
   * - uses highest spendHeight as lastProcessedHeight
   */
  it('should aggregate multiple events for same group', async () => {
    const testData = eventCountTestData.test3;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const expected = testData.expectedResults.eventCounts[0];
    const countRecord = await eventCountRepo.findOne({
      where: {
        status: expected.status,
        fromChain: expected.fromChain,
        toChain: expected.toChain,
      },
    });

    expect(countRecord).not.toBeNull();
    expect(countRecord?.eventCount).toBe(expected.count);

    expect(countRecord?.lastProcessedHeight).toBe(120);
  });

  /**
   * @target eventCountMetric should update existing counts and total metric
   * @dependency database
   * @scenario
   * - insert existing EventCountEntity and metric records
   * - insert new EventTriggerEntity records
   * - call eventCountMetric
   * @expected
   * - existing EventCountEntity records are updated with new counts
   * - total metric is incremented correctly
   */
  it('should update existing counts and total metric (test4)', async () => {
    const testData = eventCountTestData.test4;

    await eventCountRepo.insert(testData.eventCountRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.eventCounts) {
      const countRecord = await eventCountRepo.findOne({
        where: {
          status: expected.status,
          fromChain: expected.fromChain,
          toChain: expected.toChain,
        },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.eventCount).toBe(expected.count);
    }
  });

  /**
   * @target eventCountMetric should ignore events below last processed height
   * @dependency database
   * @scenario
   * - insert existing EventCountEntity with lastProcessedHeight
   * - insert EventTriggerEntity with spendHeight below last processed
   * - call eventCountMetric
   * @expected
   * - EventCountEntity remains unchanged
   * - total metric remains unchanged
   */
  it('should ignore events below last processed height', async () => {
    const testData = eventCountTestData.test5;

    await eventCountRepo.insert(testData.eventCountRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const countRecord = await eventCountRepo.findOne({
      where: {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
      },
    });
    expect(countRecord).not.toBeNull();
    expect(countRecord?.eventCount).toBe(5);
  });

  /**
   * @target eventCountMetric should handle complex scenario with multiple groups
   * @dependency database
   * @scenario
   * - insert multiple EventTriggerEntity records with various groups
   * - call eventCountMetric
   * @expected
   * - all groups correctly aggregated
   * - total metric reflects sum of all events
   */
  it('should handle complex scenario with multiple groups', async () => {
    const testData = eventCountTestData.test6;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.eventCounts) {
      const countRecord = await eventCountRepo.findOne({
        where: {
          status: expected.status,
          fromChain: expected.fromChain,
          toChain: expected.toChain,
        },
      });
      expect(countRecord).not.toBeNull();
      expect(countRecord?.eventCount).toBe(expected.count);
    }

    const allCounts = await eventCountRepo.find();
    expect(allCounts).toHaveLength(testData.expectedResults.eventCounts.length);
  });

  /**
   * @target eventCountMetric should not process non-successful/fraud events
   * @dependency database
   * @scenario
   * - insert EventTriggerEntity with status not in ['successful', 'fraud']
   * - call eventCountMetric
   * @expected
   * - non-successful/fraud events are ignored
   * - no EventCountEntity created for those events
   */
  it('should not process non-successful/fraud events', async () => {
    const testData = eventCountTestData.test1;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await eventCountMetric(dataSource, logger);

    const allCounts = await eventCountRepo.find();
    expect(allCounts).toHaveLength(3);
  });
});
