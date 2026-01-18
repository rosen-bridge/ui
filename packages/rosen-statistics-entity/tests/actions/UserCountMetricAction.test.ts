import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserCountMetricAction } from '../../lib/actions/UserCountMetricAction';
import { METRIC_KEYS } from '../../lib/constants';
import { MetricEntity, UserEventEntity } from '../../lib/entities';
import { createDatabase } from '../utils';

describe('UserCountMetricAction', () => {
  let dataSource: DataSource;
  let action: UserCountMetricAction;
  let metricRepo: Repository<MetricEntity>;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let userEventRepo: Repository<UserEventEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new UserCountMetricAction(dataSource);

    metricRepo = dataSource.getRepository(MetricEntity);
    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    userEventRepo = dataSource.getRepository(UserEventEntity);
  });

  describe('calculateAndStoreUserCounts', () => {
    /**
     * @target calculateAndStoreUserCounts should calculate and store counts per (fromAddress, toAddress) and total metric
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records with 'Success' and ignored statuses
     * - call calculateAndStoreUserCounts
     * @expected
     * - UserEventEntity rows are created for each (fromAddress,toAddress) group
     * - USER_COUNT_TOTAL metric is updated with number of rows in UserEventEntity
     */
    it('should calculate and store counts per (fromAddress, toAddress) and total metric', async () => {
      await eventTriggerRepo.insert([
        {
          eventId: 'u1',
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
          eventId: 'u2',
          boxId: 'b2',
          block: 'blk2',
          height: 101,
          extractor: 'ext2',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx2',
          fromAddress: 'addr1',
          toAddress: 'addr2',
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
          result: 'Success',
          paymentTxId: 'ptx2',
          WIDsCount: 1,
          WIDsHash: 'hash2',
          serialized: '{}',
        },
        {
          eventId: 'u3',
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
          result: 'Success',
          paymentTxId: 'ptx3',
          WIDsCount: 1,
          WIDsHash: 'hash3',
          serialized: '{}',
        },
        {
          eventId: 'u4',
          boxId: 'b4',
          block: 'blk4',
          height: 103,
          extractor: 'ext4',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx4',
          fromAddress: 'addrX',
          toAddress: 'addrY',
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
        },
      ]);

      await action.calculateAndStoreUserCounts();

      const group1 = await userEventRepo.findOne({
        where: { fromAddress: 'addr1', toAddress: 'addr2' },
      });
      const group2 = await userEventRepo.findOne({
        where: { fromAddress: 'addr3', toAddress: 'addr4' },
      });

      expect(group1).not.toBeNull();
      expect(group1?.count).toBe(2);
      expect(group1?.lastProcessedHeight).toBe(101);

      expect(group2).not.toBeNull();
      expect(group2?.count).toBe(1);
      expect(group2?.lastProcessedHeight).toBe(102);

      const metric = await metricRepo.find({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });
      expect(metric).not.toBeNull();
      expect(metric.length).toBe(1);
      expect(metric[0]?.value).toBe('2');
    });

    /**
     * @target calculateAndStoreUserCounts should skip events if none match Success
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity with ignored statuses
     * - call calculateAndStoreUserCounts
     * @expected
     * - no UserEventEntity rows created
     * - USER_COUNT_TOTAL metric is not created
     */
    it('should skip events if none match Success', async () => {
      await eventTriggerRepo.insert({
        eventId: 'u5',
        boxId: 'b5',
        block: 'blk5',
        height: 120,
        extractor: 'ext5',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx5',
        fromAddress: 'addr10',
        toAddress: 'addr11',
        amount: '7',
        bridgeFee: '0.7',
        networkFee: '0.07',
        sourceChainTokenId: 't1',
        sourceChainHeight: 120,
        targetChainTokenId: 't2',
        sourceTxId: 'stx5',
        sourceBlockId: 'sb5',
        spendBlock: 'sblk5',
        spendHeight: 130,
        spendTxId: 'spendtx5',
        result: 'Processing',
        paymentTxId: 'ptx5',
        WIDsCount: 1,
        WIDsHash: 'hash5',
        serialized: '{}',
      });

      await action.calculateAndStoreUserCounts();

      const rows = await userEventRepo.find();
      const metric = await metricRepo.findOne({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });

      expect(rows.length).toBe(0);
      expect(metric).toBeNull();
    });

    /**
     * @target calculateAndStoreUserCounts should update existing counts, ignore already-processed heights, and update total metric
     * @dependency database
     * @scenario
     * - insert existing UserEventEntity with lastProcessedHeight
     * - insert new EventTriggerEntity records (some <= lastProcessedHeight, some >)
     * - call calculateAndStoreUserCounts
     * @expected
     * - existing UserEventEntity count increases only by events with height > lastProcessedHeight
     * - lastProcessedHeight updated to max height of newly processed events
     * - USER_COUNT_TOTAL metric updated to current number of rows
     */
    it('should update existing counts, ignore already-processed heights, and update total metric', async () => {
      await userEventRepo.insert({
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 2,
        lastProcessedHeight: 100,
      });

      await eventTriggerRepo.insert({
        eventId: 'u6',
        boxId: 'b6',
        block: 'blk6',
        height: 100,
        extractor: 'ext6',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx6',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        amount: '1',
        bridgeFee: '0.1',
        networkFee: '0.01',
        sourceChainTokenId: 't1',
        sourceChainHeight: 100,
        targetChainTokenId: 't2',
        sourceTxId: 'stx6',
        sourceBlockId: 'sb6',
        spendBlock: 'sblk6',
        spendHeight: 110,
        spendTxId: 'spendtx6',
        result: 'Success',
        paymentTxId: 'ptx6',
        WIDsCount: 1,
        WIDsHash: 'hash6',
        serialized: '{}',
      });

      await eventTriggerRepo.insert([
        {
          eventId: 'u7',
          boxId: 'b7',
          block: 'blk7',
          height: 105,
          extractor: 'ext7',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx7',
          fromAddress: 'addr1',
          toAddress: 'addr2',
          amount: '2',
          bridgeFee: '0.2',
          networkFee: '0.02',
          sourceChainTokenId: 't1',
          sourceChainHeight: 105,
          targetChainTokenId: 't2',
          sourceTxId: 'stx7',
          sourceBlockId: 'sb7',
          spendBlock: 'sblk7',
          spendHeight: 115,
          spendTxId: 'spendtx7',
          result: 'Success',
          paymentTxId: 'ptx7',
          WIDsCount: 1,
          WIDsHash: 'hash7',
          serialized: '{}',
        },
        {
          eventId: 'u8',
          boxId: 'b8',
          block: 'blk8',
          height: 106,
          extractor: 'ext8',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx8',
          fromAddress: 'addr1',
          toAddress: 'addr2',
          amount: '3',
          bridgeFee: '0.3',
          networkFee: '0.03',
          sourceChainTokenId: 't1',
          sourceChainHeight: 106,
          targetChainTokenId: 't2',
          sourceTxId: 'stx8',
          sourceBlockId: 'sb8',
          spendBlock: 'sblk8',
          spendHeight: 116,
          spendTxId: 'spendtx8',
          result: 'Success',
          paymentTxId: 'ptx8',
          WIDsCount: 1,
          WIDsHash: 'hash8',
          serialized: '{}',
        },
      ]);

      await eventTriggerRepo.insert({
        eventId: 'u9',
        boxId: 'b9',
        block: 'blk9',
        height: 107,
        extractor: 'ext9',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx9',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        amount: '4',
        bridgeFee: '0.4',
        networkFee: '0.04',
        sourceChainTokenId: 't1',
        sourceChainHeight: 107,
        targetChainTokenId: 't2',
        sourceTxId: 'stx9',
        sourceBlockId: 'sb9',
        spendBlock: 'sblk9',
        spendHeight: 117,
        spendTxId: 'spendtx9',
        result: 'Success',
        paymentTxId: 'ptx9',
        WIDsCount: 1,
        WIDsHash: 'hash9',
        serialized: '{}',
      });

      await action.calculateAndStoreUserCounts();

      const updated = await userEventRepo.findOne({
        where: { fromAddress: 'addr1', toAddress: 'addr2' },
      });
      expect(updated).not.toBeNull();
      expect(updated?.count).toBe(4);
      expect(updated?.lastProcessedHeight).toBe(106);

      const secondPair = await userEventRepo.findOne({
        where: { fromAddress: 'addr3', toAddress: 'addr4' },
      });
      expect(secondPair).not.toBeNull();
      expect(secondPair?.count).toBe(1);
      expect(secondPair?.lastProcessedHeight).toBe(107);

      const metric = await metricRepo.find({
        where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
      });
      expect(metric).not.toBeNull();
      expect(metric.length).toBe(1);
      expect(metric[0]?.value).toBe('2');
    });
  });
});
