import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { describe, it, expect, beforeEach } from 'vitest';

import { BridgeFeeMetricAction } from '../../lib/actions/BridgeFeeMetricAction';
import { BridgeFeeEntity } from '../../lib/entities';
import { createDatabase } from '../utils';

describe('BridgeFeeMetricAction', () => {
  let dataSource: DataSource;
  let action: BridgeFeeMetricAction;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new BridgeFeeMetricAction(dataSource);

    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
  });

  describe('getLastProcessedHeight', () => {
    beforeEach(async () => {
      await bridgeFeeRepo.clear();
    });

    /**
     * @target getLastProcessedHeight should return undefined when no bridge fee records exist
     * @dependency database
     * @scenario
     * - ensure no BridgeFeeEntity records exist
     * - call getLastProcessedHeight
     * @expected
     * - returns undefined
     */
    it('should return undefined when no bridge fee records exist', async () => {
      const result = await action.getLastProcessedHeight();
      expect(result).toBeUndefined();
    });

    /**
     * @target getLastProcessedHeight should return highest lastProcessedHeight
     * @dependency database
     * @scenario
     * - insert BridgeFeeEntity records with different lastProcessedHeights
     * - call getLastProcessedHeight
     * @expected
     * - returns the highest lastProcessedHeight
     */
    it('should return the highest lastProcessedHeight', async () => {
      await bridgeFeeRepo.insert([
        {
          fromChain: 'ergo',
          day: 1,
          month: 1,
          year: 2024,
          week: 1,
          amount: 100,
          lastProcessedHeight: 1000,
        },
        {
          fromChain: 'cardano',
          day: 2,
          month: 1,
          year: 2024,
          week: 1,
          amount: 200,
          lastProcessedHeight: 2000,
        },
        {
          fromChain: 'ethereum',
          day: 3,
          month: 1,
          year: 2024,
          week: 1,
          amount: 300,
          lastProcessedHeight: 1500,
        },
      ]);

      const result = await action.getLastProcessedHeight();
      expect(result).toBe(2000);
    });
  });

  describe('getFirstEventTimestamp', () => {
    beforeEach(async () => {
      await eventTriggerRepo.clear();
      await blockRepo.clear();
    });

    /**
     * @target getFirstEventTimestamp should return undefined when no events exist
     * @dependency database
     * @scenario
     * - ensure no EventTriggerEntity records exist
     * - call getFirstEventTimestamp
     * @expected
     * - returns undefined
     */
    it('should return undefined when no events exist', async () => {
      const result = await action.getFirstEventTimestamp();
      expect(result).toBeUndefined();
    });

    /**
     * @target getFirstEventTimestamp should return earliest event timestamp
     * @dependency database
     * @scenario
     * - insert BlockEntity records
     * - insert EventTriggerEntity records with different spendBlocks
     * - call getFirstEventTimestamp
     * @expected
     * - returns the earliest block timestamp
     */
    it('should return the earliest event timestamp', async () => {
      await blockRepo.insert([
        {
          hash: 'block1',
          height: 100,
          status: 'PROCEED',
          timestamp: 1700000000, // Oldest
          scanner: 'ergo',
          parentHash: 'parent1',
          day: 1,
          month: 1,
          year: 2024,
        },
        {
          hash: 'block2',
          height: 200,
          status: 'PROCEED',
          timestamp: 1700086400, // 1 day later
          scanner: 'ergo',
          parentHash: 'parent2',
          day: 2,
          month: 1,
          year: 2024,
        },
        {
          hash: 'block3',
          height: 300,
          status: 'PROCEED',
          timestamp: 1700172800, // 2 days later
          scanner: 'ergo',
          parentHash: 'parent3',
          day: 3,
          month: 1,
          year: 2024,
        },
      ]);

      await eventTriggerRepo.insert([
        {
          eventId: 'event1',
          boxId: 'box1',
          block: 'block1',
          height: 100,
          extractor: 'ext1',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx1',
          fromAddress: 'addr1',
          toAddress: 'addr2',
          amount: '100',
          bridgeFee: '1',
          networkFee: '0.1',
          sourceChainTokenId: 'token1',
          sourceChainHeight: 100,
          targetChainTokenId: 'token2',
          sourceTxId: 'sourceTx1',
          sourceBlockId: 'sourceBlock1',
          spendBlock: 'block3', // Latest block
          spendHeight: 300,
          spendTxId: 'spendTx1',
          result: 'successful',
          paymentTxId: 'paymentTx1',
          WIDsCount: 1,
          WIDsHash: 'hash1',
          serialized: '{}',
        },
        {
          eventId: 'event2',
          boxId: 'box2',
          block: 'block2',
          height: 200,
          extractor: 'ext2',
          fromChain: 'cardano',
          toChain: 'ergo',
          txId: 'tx2',
          fromAddress: 'addr3',
          toAddress: 'addr4',
          amount: '200',
          bridgeFee: '2',
          networkFee: '0.2',
          sourceChainTokenId: 'token3',
          sourceChainHeight: 200,
          targetChainTokenId: 'token4',
          sourceTxId: 'sourceTx2',
          sourceBlockId: 'sourceBlock2',
          spendBlock: 'block2', // Middle block
          spendHeight: 200,
          spendTxId: 'spendTx2',
          result: 'successful',
          paymentTxId: 'paymentTx2',
          WIDsCount: 1,
          WIDsHash: 'hash2',
          serialized: '{}',
        },
        {
          eventId: 'event3',
          boxId: 'box3',
          block: 'block3',
          height: 300,
          extractor: 'ext3',
          fromChain: 'ethereum',
          toChain: 'ergo',
          txId: 'tx3',
          fromAddress: 'addr5',
          toAddress: 'addr6',
          amount: '300',
          bridgeFee: '3',
          networkFee: '0.3',
          sourceChainTokenId: 'token5',
          sourceChainHeight: 300,
          targetChainTokenId: 'token6',
          sourceTxId: 'sourceTx3',
          sourceBlockId: 'sourceBlock3',
          spendBlock: 'block1', // Earliest block
          spendHeight: 100,
          spendTxId: 'spendTx3',
          result: 'successful',
          paymentTxId: 'paymentTx3',
          WIDsCount: 1,
          WIDsHash: 'hash3',
          serialized: '{}',
        },
      ]);

      const result = await action.getFirstEventTimestamp();
      expect(result).toBe(1700000000);
    });
  });

  describe('getBlockByHeight', () => {
    beforeEach(async () => {
      await blockRepo.clear();
    });

    /**
     * @target getBlockByHeight should return block for given height
     * @dependency database
     * @scenario
     * - insert BlockEntity record
     * - call getBlockByHeight with existing height
     * @expected
     * - returns the matching BlockEntity
     */
    it('should return block for given height', async () => {
      await blockRepo.insert({
        hash: 'testBlock',
        height: 12345,
        status: 'PROCEED',
        timestamp: 1700000000,
        scanner: 'ergo',
        parentHash: 'parentHash',
        day: 1,
        month: 1,
        year: 2024,
      });

      const result = await action.getBlockByHeight(12345);
      expect(result).not.toBeNull();
      expect(result?.height).toBe(12345);
      expect(result?.scanner).toBe('ergo');
      expect(result?.timestamp).toBe(1700000000);
    });

    /**
     * @target getBlockByHeight should return null for non-existent height
     * @dependency database
     * @scenario
     * - call getBlockByHeight with non-existent height
     * @expected
     * - returns null
     */
    it('should return null for non-existent height', async () => {
      const result = await action.getBlockByHeight(99999);
      expect(result).toBeNull();
    });

    /**
     * @target getBlockByHeight should return correct block when multiple blocks exist
     * @dependency database
     * @scenario
     * - insert multiple BlockEntity records
     * - call getBlockByHeight with specific height
     * @expected
     * - returns the correct BlockEntity
     */
    it('should return correct block when multiple blocks exist', async () => {
      await blockRepo.insert([
        {
          hash: 'block1',
          height: 100,
          status: 'PROCEED',
          timestamp: 1700000000,
          scanner: 'ergo',
          parentHash: 'parent1',
          day: 1,
          month: 1,
          year: 2024,
        },
        {
          hash: 'block2',
          height: 200,
          status: 'PROCEED',
          timestamp: 1700086400,
          scanner: 'ergo',
          parentHash: 'parent2',
          day: 2,
          month: 1,
          year: 2024,
        },
        {
          hash: 'block3',
          height: 300,
          status: 'PROCEED',
          timestamp: 1700172800,
          scanner: 'ergo',
          parentHash: 'parent3',
          day: 3,
          month: 1,
          year: 2024,
        },
      ]);

      const result = await action.getBlockByHeight(200);
      expect(result).not.toBeNull();
      expect(result?.hash).toBe('block2');
      expect(result?.height).toBe(200);
    });

    /**
     * @target getBlockByHeight should only return ergo scanner blocks
     * @dependency database
     * @scenario
     * - insert BlockEntity records with different scanners
     * - call getBlockByHeight
     * @expected
     * - returns only blocks with 'ergo' scanner
     */
    it('should only return ergo scanner blocks', async () => {
      await blockRepo.insert([
        {
          hash: 'ergoBlock',
          height: 100,
          status: 'PROCEED',
          timestamp: 1700000000,
          scanner: 'ergo',
          parentHash: 'parent1',
          day: 1,
          month: 1,
          year: 2024,
        },
        {
          hash: 'cardanoBlock',
          height: 100,
          status: 'PROCEED',
          timestamp: 1700000000,
          scanner: 'cardano',
          parentHash: 'parent2',
          day: 1,
          month: 1,
          year: 2024,
        },
      ]);

      const result = await action.getBlockByHeight(100);
      expect(result).not.toBeNull();
      expect(result?.scanner).toBe('ergo');
      expect(result?.hash).toBe('ergoBlock');
    });
  });

  describe('getEventsInRange', () => {
    beforeEach(async () => {
      await eventTriggerRepo.clear();
      await blockRepo.clear();
    });

    /**
     * @target getEventsInRange should return successful events within timestamp range
     * @dependency database
     * @scenario
     * - insert BlockEntity records
     * - insert EventTriggerEntity records with different timestamps and statuses
     * - call getEventsInRange with specific range
     * @expected
     * - returns only successful events within the timestamp range
     */
    it('should return successful events within timestamp range', async () => {
      await blockRepo.insert([
        {
          hash: 'blockA',
          height: 100,
          status: 'PROCEED',
          timestamp: 1700000000,
          scanner: 'ergo',
          parentHash: 'parentA',
          day: 15,
          month: 1,
          year: 2024,
        },
        {
          hash: 'blockB',
          height: 200,
          status: 'PROCEED',
          timestamp: 1700000100, // Within range
          scanner: 'ergo',
          parentHash: 'parentB',
          day: 15,
          month: 1,
          year: 2024,
        },
        {
          hash: 'blockC',
          height: 300,
          status: 'PROCEED',
          timestamp: 1700086400, // Outside range (next day)
          scanner: 'ergo',
          parentHash: 'parentC',
          day: 16,
          month: 1,
          year: 2024,
        },
      ]);

      await eventTriggerRepo.insert([
        {
          eventId: 'event1',
          boxId: 'box1',
          block: 'blockA',
          height: 100,
          extractor: 'ext1',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx1',
          fromAddress: 'addr1',
          toAddress: 'addr2',
          amount: '100',
          bridgeFee: '1.5',
          networkFee: '0.1',
          sourceChainTokenId: 'token1',
          sourceChainHeight: 100,
          targetChainTokenId: 'token2',
          sourceTxId: 'sourceTx1',
          sourceBlockId: 'sourceBlock1',
          spendBlock: 'blockB', // Timestamp 1700000100 (within range)
          spendHeight: 200,
          spendTxId: 'spendTx1',
          result: 'successful',
          paymentTxId: 'paymentTx1',
          WIDsCount: 1,
          WIDsHash: 'hash1',
          serialized: '{}',
        },
        {
          eventId: 'event2',
          boxId: 'box2',
          block: 'blockB',
          height: 200,
          extractor: 'ext2',
          fromChain: 'cardano',
          toChain: 'ergo',
          txId: 'tx2',
          fromAddress: 'addr3',
          toAddress: 'addr4',
          amount: '200',
          bridgeFee: '2.5',
          networkFee: '0.2',
          sourceChainTokenId: 'token3',
          sourceChainHeight: 200,
          targetChainTokenId: 'token4',
          sourceTxId: 'sourceTx2',
          sourceBlockId: 'sourceBlock2',
          spendBlock: 'blockC', // Timestamp 1700086400 (outside range)
          spendHeight: 300,
          spendTxId: 'spendTx2',
          result: 'successful',
          paymentTxId: 'paymentTx2',
          WIDsCount: 1,
          WIDsHash: 'hash2',
          serialized: '{}',
        },
        {
          eventId: 'event3',
          boxId: 'box3',
          block: 'blockC',
          height: 300,
          extractor: 'ext3',
          fromChain: 'ethereum',
          toChain: 'ergo',
          txId: 'tx3',
          fromAddress: 'addr5',
          toAddress: 'addr6',
          amount: '300',
          bridgeFee: '3.5',
          networkFee: '0.3',
          sourceChainTokenId: 'token5',
          sourceChainHeight: 300,
          targetChainTokenId: 'token6',
          sourceTxId: 'sourceTx3',
          sourceBlockId: 'sourceBlock3',
          spendBlock: 'blockA',
          spendHeight: 200,
          spendTxId: 'spendTx3',
          result: 'pending', // Not successful
          paymentTxId: 'paymentTx3',
          WIDsCount: 1,
          WIDsHash: 'hash3',
          serialized: '{}',
        },
      ]);

      const startTs = 1700000000; // Inclusive
      const endTs = 1700086400; // Exclusive

      const events = await action.getEventsInRange(startTs, endTs);

      expect(events).toHaveLength(1);
      expect(events[0].bridgeFee).toBe('1.5');
      expect(events[0].fromChain).toBe('ergo');
      expect(events[0].timestamp).toBe(1700000100);
      expect(events[0].day).toBe(15);
      expect(events[0].month).toBe(1);
      expect(events[0].year).toBe(2024);
    });

    /**
     * @target getEventsInRange should return empty array when no events in range
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records outside timestamp range
     * - call getEventsInRange with different range
     * @expected
     * - returns empty array
     */
    it('should return empty array when no events in range', async () => {
      // Insert a block
      await blockRepo.insert({
        hash: 'block1',
        height: 100,
        status: 'PROCEED',
        timestamp: 1700000000,
        scanner: 'ergo',
        parentHash: 'parent1',
        day: 1,
        month: 1,
        year: 2024,
      });

      // Insert event outside our test range
      await eventTriggerRepo.insert({
        eventId: 'event1',
        boxId: 'box1',
        block: 'block1',
        height: 100,
        extractor: 'ext1',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        amount: '100',
        bridgeFee: '1',
        networkFee: '0.1',
        sourceChainTokenId: 'token1',
        sourceChainHeight: 100,
        targetChainTokenId: 'token2',
        sourceTxId: 'sourceTx1',
        sourceBlockId: 'sourceBlock1',
        spendBlock: 'block1',
        spendHeight: 100,
        spendTxId: 'spendTx1',
        result: 'successful',
        paymentTxId: 'paymentTx1',
        WIDsCount: 1,
        WIDsHash: 'hash1',
        serialized: '{}',
      });

      // Query for range where no events exist
      const events = await action.getEventsInRange(1800000000, 1900000000);
      expect(events).toHaveLength(0);
    });

    /**
     * @target getEventsInRange should return multiple events when they exist in range
     * @dependency database
     * @scenario
     * - insert multiple EventTriggerEntity records within timestamp range
     * - call getEventsInRange
     * @expected
     * - returns all events within the range
     */
    it('should return multiple events when they exist in range', async () => {
      await blockRepo.insert([
        {
          hash: 'block1',
          height: 100,
          status: 'PROCEED',
          timestamp: 1700000000,
          scanner: 'ergo',
          parentHash: 'parent1',
          day: 1,
          month: 1,
          year: 2024,
        },
        {
          hash: 'block2',
          height: 200,
          status: 'PROCEED',
          timestamp: 1700000100,
          scanner: 'ergo',
          parentHash: 'parent2',
          day: 1,
          month: 1,
          year: 2024,
        },
      ]);

      await eventTriggerRepo.insert([
        {
          eventId: 'event1',
          boxId: 'box1',
          block: 'block1',
          height: 100,
          extractor: 'ext1',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx1',
          fromAddress: 'addr1',
          toAddress: 'addr2',
          amount: '100',
          bridgeFee: '1',
          networkFee: '0.1',
          sourceChainTokenId: 'token1',
          sourceChainHeight: 100,
          targetChainTokenId: 'token2',
          sourceTxId: 'sourceTx1',
          sourceBlockId: 'sourceBlock1',
          spendBlock: 'block1',
          spendHeight: 100,
          spendTxId: 'spendTx1',
          result: 'successful',
          paymentTxId: 'paymentTx1',
          WIDsCount: 1,
          WIDsHash: 'hash1',
          serialized: '{}',
        },
        {
          eventId: 'event2',
          boxId: 'box2',
          block: 'block2',
          height: 200,
          extractor: 'ext2',
          fromChain: 'cardano',
          toChain: 'ergo',
          txId: 'tx2',
          fromAddress: 'addr3',
          toAddress: 'addr4',
          amount: '200',
          bridgeFee: '2',
          networkFee: '0.2',
          sourceChainTokenId: 'token3',
          sourceChainHeight: 200,
          targetChainTokenId: 'token4',
          sourceTxId: 'sourceTx2',
          sourceBlockId: 'sourceBlock2',
          spendBlock: 'block2',
          spendHeight: 200,
          spendTxId: 'spendTx2',
          result: 'successful',
          paymentTxId: 'paymentTx2',
          WIDsCount: 1,
          WIDsHash: 'hash2',
          serialized: '{}',
        },
      ]);

      const events = await action.getEventsInRange(1700000000, 1700000200);
      expect(events).toHaveLength(2);
      expect(events[0].bridgeFee).toBe('1');
      expect(events[1].bridgeFee).toBe('2');
    });

    /**
     * @target getEventsInRange should exclude non-successful events
     * @dependency database
     * @scenario
     * - insert EventTriggerEntity records with different result statuses
     * - call getEventsInRange
     * @expected
     * - returns only events with result = 'successful'
     */
    it('should exclude non-successful events', async () => {
      await blockRepo.insert({
        hash: 'block1',
        height: 100,
        status: 'PROCEED',
        timestamp: 1700000000,
        scanner: 'ergo',
        parentHash: 'parent1',
        day: 1,
        month: 1,
        year: 2024,
      });

      await eventTriggerRepo.insert([
        {
          eventId: 'event1',
          boxId: 'box1',
          block: 'block1',
          height: 100,
          extractor: 'ext1',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx1',
          fromAddress: 'addr1',
          toAddress: 'addr2',
          amount: '100',
          bridgeFee: '1',
          networkFee: '0.1',
          sourceChainTokenId: 'token1',
          sourceChainHeight: 100,
          targetChainTokenId: 'token2',
          sourceTxId: 'sourceTx1',
          sourceBlockId: 'sourceBlock1',
          spendBlock: 'block1',
          spendHeight: 100,
          spendTxId: 'spendTx1',
          result: 'successful',
          paymentTxId: 'paymentTx1',
          WIDsCount: 1,
          WIDsHash: 'hash1',
          serialized: '{}',
        },
        {
          eventId: 'event2',
          boxId: 'box2',
          block: 'block1',
          height: 100,
          extractor: 'ext2',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx2',
          fromAddress: 'addr3',
          toAddress: 'addr4',
          amount: '200',
          bridgeFee: '2',
          networkFee: '0.2',
          sourceChainTokenId: 'token3',
          sourceChainHeight: 100,
          targetChainTokenId: 'token4',
          sourceTxId: 'sourceTx2',
          sourceBlockId: 'sourceBlock2',
          spendBlock: 'block1',
          spendHeight: 100,
          spendTxId: 'spendTx2',
          result: 'fraud', // Not successful
          paymentTxId: 'paymentTx2',
          WIDsCount: 1,
          WIDsHash: 'hash2',
          serialized: '{}',
        },
        {
          eventId: 'event3',
          boxId: 'box3',
          block: 'block1',
          height: 100,
          extractor: 'ext3',
          fromChain: 'ergo',
          toChain: 'cardano',
          txId: 'tx3',
          fromAddress: 'addr5',
          toAddress: 'addr6',
          amount: '300',
          bridgeFee: '3',
          networkFee: '0.3',
          sourceChainTokenId: 'token5',
          sourceChainHeight: 100,
          targetChainTokenId: 'token6',
          sourceTxId: 'sourceTx3',
          sourceBlockId: 'sourceBlock3',
          spendBlock: 'block1',
          spendHeight: 100,
          spendTxId: 'spendTx3',
          result: 'pending', // Not successful
          paymentTxId: 'paymentTx3',
          WIDsCount: 1,
          WIDsHash: 'hash3',
          serialized: '{}',
        },
      ]);

      const events = await action.getEventsInRange(1700000000, 1700000100);
      expect(events).toHaveLength(1);
      expect(events[0].bridgeFee).toBe('1');
    });
  });

  describe('upsertBridgeFee', () => {
    beforeEach(async () => {
      await bridgeFeeRepo.clear();
    });

    /**
     * @target upsertBridgeFee should insert new bridge fee record
     * @dependency database
     * @scenario
     * - call upsertBridgeFee with new data
     * - verify record was created
     * @expected
     * - new BridgeFeeEntity record is created
     */
    it('should insert new bridge fee record', async () => {
      const data = {
        fromChain: 'ergo',
        day: 15,
        month: 1,
        year: 2024,
        week: 3,
        amount: 123.45,
        lastProcessedHeight: 1000,
      };

      await action.upsertBridgeFee(data);

      const result = await bridgeFeeRepo.findOne({
        where: {
          fromChain: 'ergo',
          day: 15,
          month: 1,
          year: 2024,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(123.45);
      expect(result?.lastProcessedHeight).toBe(1000);
      expect(result?.week).toBe(3);
    });

    /**
     * @target upsertBridgeFee should update existing bridge fee record
     * @dependency database
     * @scenario
     * - insert existing BridgeFeeEntity
     * - call upsertBridgeFee with same composite key but different amount
     * - verify record was updated
     * @expected
     * - existing BridgeFeeEntity record is updated
     */
    it('should update existing bridge fee record', async () => {
      await bridgeFeeRepo.insert({
        fromChain: 'cardano',
        day: 20,
        month: 2,
        year: 2024,
        week: 8,
        amount: 100,
        lastProcessedHeight: 500,
      });

      const updateData = {
        fromChain: 'cardano',
        day: 20,
        month: 2,
        year: 2024,
        week: 8,
        amount: 250,
        lastProcessedHeight: 750,
      };

      await action.upsertBridgeFee(updateData);

      const allRecords = await bridgeFeeRepo.find();
      expect(allRecords).toHaveLength(1);

      const result = await bridgeFeeRepo.findOne({
        where: {
          fromChain: 'cardano',
          day: 20,
          month: 2,
          year: 2024,
        },
      });

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(250);
      expect(result?.lastProcessedHeight).toBe(750);
    });

    /**
     * @target upsertBridgeFee should handle multiple upserts correctly
     * @dependency database
     * @scenario
     * - call upsertBridgeFee multiple times with different data
     * - verify all records are properly managed
     * @expected
     * - all BridgeFeeEntity records are correctly inserted/updated
     */
    it('should handle multiple upserts correctly', async () => {
      const testData = [
        {
          fromChain: 'ergo',
          day: 1,
          month: 1,
          year: 2024,
          week: 1,
          amount: 100,
          lastProcessedHeight: 1000,
        },
        {
          fromChain: 'cardano',
          day: 1,
          month: 1,
          year: 2024,
          week: 1,
          amount: 200,
          lastProcessedHeight: 2000,
        },
        {
          fromChain: 'ergo',
          day: 1,
          month: 1,
          year: 2024, // Same as first record - should update
          week: 1,
          amount: 150,
          lastProcessedHeight: 1500,
        },
        {
          fromChain: 'ethereum',
          day: 2,
          month: 1,
          year: 2024,
          week: 1,
          amount: 300,
          lastProcessedHeight: 3000,
        },
      ];

      for (const data of testData) {
        await action.upsertBridgeFee(data);
      }

      const allRecords = await bridgeFeeRepo.find();

      expect(allRecords).toHaveLength(3);

      const ergoRecord = allRecords.find((r) => r.fromChain === 'ergo');
      expect(ergoRecord?.amount).toBe(150);
      expect(ergoRecord?.lastProcessedHeight).toBe(1500);

      const cardanoRecord = allRecords.find((r) => r.fromChain === 'cardano');
      expect(cardanoRecord?.amount).toBe(200);

      const ethereumRecord = allRecords.find((r) => r.fromChain === 'ethereum');
      expect(ethereumRecord?.amount).toBe(300);
    });

    /**
     * @target upsertBridgeFee should insert multiple records with different composite keys
     * @dependency database
     * @scenario
     * - call upsertBridgeFee with different composite keys
     * - verify all records are inserted separately
     * @expected
     * - each unique combination of fromChain+day+month+year creates a separate record
     */
    it('should insert multiple records with different composite keys', async () => {
      const testData = [
        {
          fromChain: 'ergo',
          day: 1,
          month: 1,
          year: 2024,
          week: 1,
          amount: 100,
          lastProcessedHeight: 1000,
        },
        {
          fromChain: 'ergo',
          day: 2,
          month: 1,
          year: 2024,
          week: 1,
          amount: 200,
          lastProcessedHeight: 2000,
        },
        {
          fromChain: 'cardano',
          day: 1,
          month: 1,
          year: 2024,
          week: 1,
          amount: 300,
          lastProcessedHeight: 3000,
        },
        {
          fromChain: 'cardano',
          day: 1,
          month: 2,
          year: 2024,
          week: 5,
          amount: 400,
          lastProcessedHeight: 4000,
        },
      ];

      for (const data of testData) {
        await action.upsertBridgeFee(data);
      }

      const allRecords = await bridgeFeeRepo.find();
      expect(allRecords).toHaveLength(4);

      const ergoDay1 = allRecords.find(
        (r) =>
          r.fromChain === 'ergo' &&
          r.day === 1 &&
          r.month === 1 &&
          r.year === 2024,
      );
      expect(ergoDay1?.amount).toBe(100);

      const ergoDay2 = allRecords.find(
        (r) =>
          r.fromChain === 'ergo' &&
          r.day === 2 &&
          r.month === 1 &&
          r.year === 2024,
      );
      expect(ergoDay2?.amount).toBe(200);

      const cardanoMonth1 = allRecords.find(
        (r) =>
          r.fromChain === 'cardano' &&
          r.day === 1 &&
          r.month === 1 &&
          r.year === 2024,
      );
      expect(cardanoMonth1?.amount).toBe(300);

      const cardanoMonth2 = allRecords.find(
        (r) =>
          r.fromChain === 'cardano' &&
          r.day === 1 &&
          r.month === 2 &&
          r.year === 2024,
      );
      expect(cardanoMonth2?.amount).toBe(400);
    });
  });
});
