import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { METRIC_KEYS, MetricEntity } from '@rosen-ui/rosen-statistics-entity';
import { UserEventEntity } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { userEventMetric } from '../../lib';
import { userEventMetricTestData } from '../data/test-data';
import { createDatabase } from '../utils';

describe('userEventMetric', () => {
  let dataSource: DataSource;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;
  let logger: DummyLogger;

  beforeEach(async () => {
    dataSource = await createDatabase();
    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    userEventRepo = dataSource.getRepository(UserEventEntity);

    logger = new DummyLogger();

    await metricRepo.clear();
    await eventTriggerRepo.clear();
    await userEventRepo.clear();
  });

  /**
   * @target userEventMetric should calculate and store user event counts
   * @dependency database
   * @scenario
   * - insert EventTriggerEntity records with different fromAddress/toAddress pairs
   * - call userEventMetric
   * @expected
   * - user event records are created for each unique fromAddress/toAddress pair
   * - total metric USER_EVENT_TOTAL is updated with correct value
   */
  it('should calculate and store user event counts (test1)', async () => {
    const testData = userEventMetricTestData.test1;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.userEvents) {
      const userEventRecord = await userEventRepo.findOne({
        where: {
          fromAddress: expected.fromAddress,
          toAddress: expected.toAddress,
        },
      });
      expect(userEventRecord).not.toBeNull();
      expect(userEventRecord?.count).toBe(expected.count);
    }

    const allUserEvents = await userEventRepo.find();
    expect(allUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );
  });

  /**
   * @target userEventMetric should handle no new events gracefully
   * @dependency database
   * @scenario
   * - insert existing user event and metric records
   * - don't insert new events
   * - call userEventMetric
   * @expected
   * - existing records remain unchanged
   * - metric value stays the same
   */
  it('should handle no new events gracefully (test2)', async () => {
    const testData = userEventMetricTestData.test2;

    await userEventRepo.insert(testData.userEventRepo);
    await metricRepo.insert(testData.metricRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.userEvents) {
      const userEventRecord = await userEventRepo.findOne({
        where: {
          fromAddress: expected.fromAddress,
          toAddress: expected.toAddress,
        },
      });
      expect(userEventRecord).not.toBeNull();
      expect(userEventRecord?.count).toBe(expected.count);
    }
  });

  /**
   * @target userEventMetric should aggregate multiple events for same user pair
   * @dependency database
   * @scenario
   * - insert multiple EventTriggerEntity records for same fromAddress/toAddress
   * - call userEventMetric
   * @expected
   * - single user event record created with aggregated count
   * - uses highest spendHeight as lastProcessedHeight
   */
  it('should aggregate multiple events for same user pair (test3)', async () => {
    const testData = userEventMetricTestData.test3;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const expected = testData.expectedResults.userEvents[0];
    const userEventRecord = await userEventRepo.findOne({
      where: {
        fromAddress: expected.fromAddress,
        toAddress: expected.toAddress,
      },
    });

    expect(userEventRecord).not.toBeNull();
    expect(userEventRecord?.count).toBe(expected.count);

    expect(userEventRecord?.lastProcessedHeight).toBe(120);
  });

  /**
   * @target userEventMetric should update existing user events and total metric
   * @dependency database
   * @scenario
   * - insert existing user events and metric records
   * - insert new EventTriggerEntity records
   * - call userEventMetric
   * @expected
   * - existing user event records are updated with new counts
   * - total metric is incremented correctly
   */
  it('should update existing user events and total metric (test4)', async () => {
    const testData = userEventMetricTestData.test4;

    await userEventRepo.insert(testData.userEventRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.userEvents) {
      const userEventRecord = await userEventRepo.findOne({
        where: {
          fromAddress: expected.fromAddress,
          toAddress: expected.toAddress,
        },
      });
      expect(userEventRecord).not.toBeNull();
      expect(userEventRecord?.count).toBe(expected.count);
    }
  });

  /**
   * @target userEventMetric should ignore events below last processed height
   * @dependency database
   * @scenario
   * - insert existing user event with lastProcessedHeight
   * - insert EventTriggerEntity with spendHeight below last processed
   * - call userEventMetric
   * @expected
   * - user event remains unchanged
   * - total metric remains unchanged
   */
  it('should ignore events below last processed height (test5)', async () => {
    const testData = userEventMetricTestData.test5;

    await userEventRepo.insert(testData.userEventRepo);
    await metricRepo.insert(testData.metricRepo);
    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    const userEventRecord = await userEventRepo.findOne({
      where: {
        fromAddress: 'addr1',
        toAddress: 'addr2',
      },
    });
    expect(userEventRecord).not.toBeNull();
    expect(userEventRecord?.count).toBe(5);
  });

  /**
   * @target userEventMetric should handle complex scenario with multiple user pairs
   * @dependency database
   * @scenario
   * - insert multiple EventTriggerEntity records with various user pairs
   * - call userEventMetric
   * @expected
   * - all user pairs correctly aggregated
   * - total metric reflects sum of all events
   */
  it('should handle complex scenario with multiple user pairs (test6)', async () => {
    const testData = userEventMetricTestData.test6;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await userEventMetric(dataSource, logger);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe(testData.expectedResults.totalMetricValue);

    for (const expected of testData.expectedResults.userEvents) {
      const userEventRecord = await userEventRepo.findOne({
        where: {
          fromAddress: expected.fromAddress,
          toAddress: expected.toAddress,
        },
      });
      expect(userEventRecord).not.toBeNull();
      expect(userEventRecord?.count).toBe(expected.count);
    }

    const allUserEvents = await userEventRepo.find();
    expect(allUserEvents).toHaveLength(
      testData.expectedResults.userEvents.length,
    );
  });

  /**
   * @target userEventMetric should not process non-successful events
   * @dependency database
   * @scenario
   * - insert EventTriggerEntity with status not 'successful'
   * - call userEventMetric
   * @expected
   * - non-successful events are ignored
   * - no user event created for those events
   */
  it('should not process non-successful events', async () => {
    const testData = userEventMetricTestData.test1;

    await eventTriggerRepo.insert(testData.eventTriggerRepo);

    await userEventMetric(dataSource, logger);

    const allUserEvents = await userEventRepo.find();
    expect(allUserEvents).toHaveLength(3);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric?.value).toBe('3');
  });
});
