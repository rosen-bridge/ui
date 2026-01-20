import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import {
  MetricEntity,
  EventCountEntity,
  METRIC_KEYS,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { eventCountMetric } from '../../lib/jobs';
import { createDatabase } from '../utils';

describe('eventCountMetric', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let eventCountRepository: Repository<EventCountEntity>;
  let eventTriggerRepository: Repository<EventTriggerEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    await dataSource.synchronize(true);
    metricRepository = dataSource.getRepository(MetricEntity);
    eventCountRepository = dataSource.getRepository(EventCountEntity);
    eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
  });

  /**
   * @target eventCountMetric should calculate and store event count metric
   * @dependency database
   * @scenario
   * - insert event triggers into database
   * - insert existing event count and metric entries
   * - call eventCountMetric
   * @expected
   * - EVENT_COUNT_TOTAL metric is stored with correct value
   */
  it('should calculate and store event count metric', async () => {
    await eventCountRepository.insert({
      status: 'Success',
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 2,
      lastProcessedHeight: 100,
    });
    await metricRepository.insert({
      key: METRIC_KEYS.EVENT_COUNT_TOTAL,
      value: '2',
      updatedAt: 1_000,
    });

    await eventTriggerRepository.insert({
      eventId: 'e5',
      boxId: 'b5',
      block: 'blk5',
      height: 105,
      extractor: 'ext5',
      fromChain: 'ergo',
      toChain: 'cardano',
      txId: 'tx5',
      fromAddress: 'addr5',
      toAddress: 'addr6',
      amount: '3',
      bridgeFee: '0.3',
      networkFee: '0.03',
      sourceChainTokenId: 't1',
      sourceChainHeight: 105,
      targetChainTokenId: 't2',
      sourceTxId: 'stx5',
      sourceBlockId: 'sb5',
      spendBlock: 'sblk5',
      spendHeight: 115,
      spendTxId: 'spendtx5',
      result: 'Success',
      paymentTxId: 'ptx5',
      WIDsCount: 1,
      WIDsHash: 'hash5',
      serialized: '{}',
    });

    await eventCountMetric(dataSource);

    const updated = await eventCountRepository.findOne({
      where: { status: 'Success', fromChain: 'ergo', toChain: 'cardano' },
    });
    expect(updated).not.toBeNull();
    expect(updated?.eventCount).toBe(3);
    expect(updated?.lastProcessedHeight).toBe(105);

    const metric = await metricRepository.find({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric.length).toBe(1);
    expect(metric[0]?.value).toBe('3');
  });
});
