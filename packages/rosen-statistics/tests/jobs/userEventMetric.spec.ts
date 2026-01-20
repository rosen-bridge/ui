import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  MetricEntity,
  UserEventEntity,
  METRIC_KEYS,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { userEventMetric } from '../../lib/jobs';
import { eventTriggerData } from '../test-data';
import { createDatabase } from '../utils';

describe('userEventMetric', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let userEventRepository: Repository<UserEventEntity>;
  let eventTriggerRepository: Repository<EventTriggerEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    await dataSource.synchronize(true);
    metricRepository = dataSource.getRepository(MetricEntity);
    userEventRepository = dataSource.getRepository(UserEventEntity);
    eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
  });

  /**
   * @target userEventMetric should calculate and store user event metric
   * @dependency database
   * @scenario
   * - insert existing UserEventEntity
   * - insert new EventTriggerEntity with height > lastProcessedHeight
   * - call userEventMetric
   * @expected
   * - existing UserEventEntity count increases by new event
   * - lastProcessedHeight updated to max height of newly processed events
   * - USER_EVENT_TOTAL metric updated to current number of rows
   */
  it('should calculate and store user event metric', async () => {
    await userEventRepository.insert({
      fromAddress: 'addr5',
      toAddress: 'addr6',
      count: 2,
      lastProcessedHeight: 100,
    });
    await metricRepository.insert({
      key: METRIC_KEYS.USER_EVENT_TOTAL,
      value: '2',
      updatedAt: 1_000,
    });

    await eventTriggerRepository.insert(eventTriggerData);

    await userEventMetric(dataSource);

    const updated = await userEventRepository.findOne({
      where: { fromAddress: 'addr5', toAddress: 'addr6' },
    });
    expect(updated).not.toBeNull();
    expect(updated?.count).toBe(3);
    expect(updated?.lastProcessedHeight).toBe(105);

    const metric = await metricRepository.find({
      where: { key: METRIC_KEYS.USER_EVENT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric.length).toBe(1);
    expect(metric[0]?.value).toBe('1');
  });
});
