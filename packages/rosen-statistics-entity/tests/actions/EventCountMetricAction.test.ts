import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import { EventCountMetricAction } from '../../lib/actions/EventCountMetricAction';
import { METRIC_KEYS } from '../../lib/constants';
import { EventCountEntity, MetricEntity } from '../../lib/entities';
import { createDatabase } from '../utils';

describe('EventCountMetricAction', () => {
  let dataSource: DataSource;
  let action: EventCountMetricAction;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let eventCountRepo: Repository<EventCountEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new EventCountMetricAction(dataSource);

    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    eventCountRepo = dataSource.getRepository(EventCountEntity);
  });

  /**
   * @target calculateAndStoreEventCounts should calculate counts per status/fromChain/toChain
   * @dependency database
   * @scenario
   * - insert EventTriggerEntity records with 'Success' and 'Fraud'
   * - call calculateAndStoreEventCounts
   * @expected
   * - EventCountEntity rows are created for each group
   * - total metric EVENT_COUNT_TOTAL is updated
   */
  it('should calculate and store counts per (status, fromChain, toChain) and total metric', async () => {
    await eventTriggerRepo.insert([
      {
        eventId: 'e1',
        boxId: 'b1',
        block: 'blk1',
        height: 100,
        extractor: 'ext1',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        amount: '10',
        bridgeFee: '1',
        networkFee: '0.1',
        sourceChainTokenId: 't1',
        sourceChainHeight: 100,
        targetChainTokenId: 't2',
        sourceTxId: 'stx1',
        sourceBlockId: 'sb1',
        spendBlock: 'sblk1',
        spendHeight: 110,
        spendTxId: 'spendtx1',
        result: 'Success',
        paymentTxId: 'ptx1',
        WIDsCount: 1,
        WIDsHash: 'hash1',
        serialized: '{}',
      },
      {
        eventId: 'e2',
        boxId: 'b2',
        block: 'blk2',
        height: 101,
        extractor: 'ext2',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx2',
        fromAddress: 'addr2',
        toAddress: 'addr3',
        amount: '5',
        bridgeFee: '0.5',
        networkFee: '0.05',
        sourceChainTokenId: 't1',
        sourceChainHeight: 101,
        targetChainTokenId: 't2',
        sourceTxId: 'stx2',
        sourceBlockId: 'sb2',
        spendBlock: 'sblk2',
        spendHeight: 111,
        spendTxId: 'spendtx2',
        result: 'Fraud',
        paymentTxId: 'ptx2',
        WIDsCount: 1,
        WIDsHash: 'hash2',
        serialized: '{}',
      },
      {
        eventId: 'e3',
        boxId: 'b3',
        block: 'blk3',
        height: 102,
        extractor: 'ext3',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx3',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        amount: '2',
        bridgeFee: '0.2',
        networkFee: '0.02',
        sourceChainTokenId: 't1',
        sourceChainHeight: 102,
        targetChainTokenId: 't2',
        sourceTxId: 'stx3',
        sourceBlockId: 'sb3',
        spendBlock: 'sblk3',
        spendHeight: 112,
        spendTxId: 'spendtx3',
        result: 'Processing',
        paymentTxId: 'ptx3',
        WIDsCount: 1,
        WIDsHash: 'hash3',
        serialized: '{}',
      },
    ]);

    await action.calculateAndStoreEventCounts();

    const successCount = await eventCountRepo.findOne({
      where: { status: 'Success', fromChain: 'ergo', toChain: 'cardano' },
    });
    const fraudCount = await eventCountRepo.findOne({
      where: { status: 'Fraud', fromChain: 'ergo', toChain: 'cardano' },
    });

    expect(successCount).not.toBeNull();
    expect(successCount?.eventCount).toBe(1);

    expect(fraudCount).not.toBeNull();
    expect(fraudCount?.eventCount).toBe(1);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe('2');
  });

  /**
   * @target calculateAndStoreEventCounts should skip events if none match Success/Fraud
   * @dependency database
   * @scenario
   * - insert EventTriggerEntity with ignored statuses
   * - call calculateAndStoreEventCounts
   * @expected
   * - no EventCountEntity rows created
   * - total metric is not created
   */
  it('should skip events if none match Success/Fraud', async () => {
    await eventTriggerRepo.insert({
      eventId: 'e4',
      boxId: 'b4',
      block: 'blk4',
      height: 103,
      extractor: 'ext4',
      fromChain: 'ergo',
      toChain: 'cardano',
      txId: 'tx4',
      fromAddress: 'addr4',
      toAddress: 'addr5',
      amount: '7',
      bridgeFee: '0.7',
      networkFee: '0.07',
      sourceChainTokenId: 't1',
      sourceChainHeight: 103,
      targetChainTokenId: 't2',
      sourceTxId: 'stx4',
      sourceBlockId: 'sb4',
      spendBlock: 'sblk4',
      spendHeight: 113,
      spendTxId: 'spendtx4',
      result: 'Processing',
      paymentTxId: 'ptx4',
      WIDsCount: 1,
      WIDsHash: 'hash4',
      serialized: '{}',
    });

    await action.calculateAndStoreEventCounts();

    const counts = await eventCountRepo.find();
    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });

    expect(counts.length).toBe(0);
    expect(metric).toBeNull();
  });

  /**
   * @target calculateAndStoreEventCounts should update existing counts and total metric
   * @dependency database
   * @scenario
   * - insert existing EventCountEntity and total metric
   * - insert new EventTriggerEntity
   * - call calculateAndStoreEventCounts
   * @expected
   * - EventCountEntity updated with new count
   * - lastProcessedHeight updated
   * - total metric incremented
   */
  it('should update existing counts and total metric', async () => {
    await eventCountRepo.insert({
      status: 'Success',
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 2,
      lastProcessedHeight: 100,
    });
    await metricRepo.insert({
      key: METRIC_KEYS.EVENT_COUNT_TOTAL,
      value: '2',
      updatedAt: 1_000,
    });

    await eventTriggerRepo.insert({
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

    await action.calculateAndStoreEventCounts();

    const updated = await eventCountRepo.findOne({
      where: { status: 'Success', fromChain: 'ergo', toChain: 'cardano' },
    });
    expect(updated).not.toBeNull();
    expect(updated?.eventCount).toBe(3); // 2 + 1
    expect(updated?.lastProcessedHeight).toBe(105);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });
    expect(metric?.value).toBe('3');
  });
});
