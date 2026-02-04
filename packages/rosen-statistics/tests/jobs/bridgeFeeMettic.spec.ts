import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { MetricEntity } from '@rosen-ui/rosen-statistics-entity';
import {
  METRIC_KEYS,
  BridgeFeeEntity,
} from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { bridgeFeeMetric } from '../../lib/jobs/bridgeFeeMetric';
import { createDatabase } from '../utils';

describe('bridgeFeeMetric', () => {
  let dataSource: DataSource;
  let logger: AbstractLogger;
  let eventTriggerRepo: Repository<EventTriggerEntity>;
  let blockRepo: Repository<BlockEntity>;
  let bridgeFeeRepo: Repository<BridgeFeeEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let metricRepo: Repository<MetricEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    logger = new DummyLogger();

    eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    blockRepo = dataSource.getRepository(BlockEntity);
    bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    metricRepo = dataSource.getRepository(MetricEntity);

    await eventTriggerRepo.clear();
    await blockRepo.clear();
    await bridgeFeeRepo.clear();
    await tokenPriceRepo.clear();
    await metricRepo.clear();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-20T00:00:00Z')); // Timestamp: 1705708800
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
    await blockRepo.insert([
      {
        hash: 'block1',
        height: 100,
        status: 'PROCEED',
        timestamp: 1705622400, // 2024-01-19 00:00:00 UTC
        scanner: 'ergo',
        parentHash: 'parent1',
        day: 19,
        month: 1,
        year: 2024,
      },
      {
        hash: 'block2',
        height: 101,
        status: 'PROCEED',
        timestamp: 1705622400, // Same day
        scanner: 'ergo',
        parentHash: 'parent2',
        day: 19,
        month: 1,
        year: 2024,
      },
    ]);

    await tokenPriceRepo.insert([
      {
        tokenId: 'token1',
        price: 2.5,
        timestamp: 1705622300,
      },
      {
        tokenId: 'token2',
        price: 3.0,
        timestamp: 1705622300,
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
        bridgeFee: '10',
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
        height: 101,
        extractor: 'ext2',
        fromChain: 'cardano',
        toChain: 'ergo',
        txId: 'tx2',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        amount: '200',
        bridgeFee: '15',
        networkFee: '0.2',
        sourceChainTokenId: 'token2',
        sourceChainHeight: 101,
        targetChainTokenId: 'token1',
        sourceTxId: 'sourceTx2',
        sourceBlockId: 'sourceBlock2',
        spendBlock: 'block1', // Same block as first event
        spendHeight: 100,
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
        block: 'block2',
        height: 101,
        extractor: 'ext3',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx3',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        amount: '50',
        bridgeFee: '5',
        networkFee: '0.05',
        sourceChainTokenId: 'token1',
        sourceChainHeight: 101,
        targetChainTokenId: 'token2',
        sourceTxId: 'sourceTx3',
        sourceBlockId: 'sourceBlock3',
        spendBlock: 'block2',
        spendHeight: 101,
        spendTxId: 'spendTx3',
        result: 'pending', // Should be ignored
        paymentTxId: 'paymentTx3',
        WIDsCount: 1,
        WIDsHash: 'hash3',
        serialized: '{}',
      },
    ]);

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find();
    expect(bridgeFeeRecords).toHaveLength(2);

    // ergo: event1 (10 token1 * $2.5 = $25)
    // cardano: event2 (15 token2 * $3.0 = $45)
    const ergoRecord = bridgeFeeRecords.find((r) => r.fromChain === 'ergo');
    const cardanoRecord = bridgeFeeRecords.find(
      (r) => r.fromChain === 'cardano',
    );

    expect(ergoRecord).not.toBeNull();
    expect(ergoRecord?.amount).toBe(25);
    expect(ergoRecord?.lastProcessedHeight).toBe(100);

    expect(cardanoRecord).not.toBeNull();
    expect(cardanoRecord?.amount).toBe(45);
    expect(cardanoRecord?.lastProcessedHeight).toBe(100);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe('70'); // $25 + $45 = $70
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
    await bridgeFeeRepo.insert({
      fromChain: 'ergo',
      day: 18,
      month: 1,
      year: 2024,
      week: 3,
      amount: 100,
      lastProcessedHeight: 150,
    });

    await metricRepo.insert({
      key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
      value: '100',
      updatedAt: 1705536000,
    });

    await blockRepo.insert({
      hash: 'lastBlock',
      height: 150,
      status: 'PROCEED',
      timestamp: 1705536000, // 2024-01-18 00:00:00 UTC
      scanner: 'ergo',
      parentHash: 'parentLast',
      day: 18,
      month: 1,
      year: 2024,
    });

    await blockRepo.insert([
      {
        hash: 'newBlock1',
        height: 151,
        status: 'PROCEED',
        timestamp: 1705622400, // 2024-01-19 00:00:00 UTC
        scanner: 'ergo',
        parentHash: 'parentNew1',
        day: 19,
        month: 1,
        year: 2024,
      },
      {
        hash: 'newBlock2',
        height: 152,
        status: 'PROCEED',
        timestamp: 1705622400, // Same day
        scanner: 'ergo',
        parentHash: 'parentNew2',
        day: 19,
        month: 1,
        year: 2024,
      },
    ]);

    await tokenPriceRepo.insert({
      tokenId: 'token1',
      price: 2.0,
      timestamp: 1705622300,
    });

    await eventTriggerRepo.insert({
      eventId: 'newEvent',
      boxId: 'newBox',
      block: 'newBlock1',
      height: 151,
      extractor: 'extNew',
      fromChain: 'ergo',
      toChain: 'cardano',
      txId: 'newTx',
      fromAddress: 'newAddr1',
      toAddress: 'newAddr2',
      amount: '50',
      bridgeFee: '10',
      networkFee: '0.1',
      sourceChainTokenId: 'token1',
      sourceChainHeight: 151,
      targetChainTokenId: 'token2',
      sourceTxId: 'newSourceTx',
      sourceBlockId: 'newSourceBlock',
      spendBlock: 'newBlock1',
      spendHeight: 151,
      spendTxId: 'newSpendTx',
      result: 'successful',
      paymentTxId: 'newPaymentTx',
      WIDsCount: 1,
      WIDsHash: 'newHash',
      serialized: '{}',
    });

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find({
      order: { year: 'ASC', month: 'ASC', day: 'ASC' },
    });

    expect(bridgeFeeRecords).toHaveLength(2);

    const day19Record = bridgeFeeRecords.find(
      (r) => r.day === 19 && r.month === 1 && r.year === 2024,
    );
    expect(day19Record).not.toBeNull();
    expect(day19Record?.amount).toBe(20); // 10 tokens * $2.0 = $20
    expect(day19Record?.lastProcessedHeight).toBe(151);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric).not.toBeNull();
    expect(metric?.value).toBe('120'); // $100 existing + $20 new = $120
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
    await blockRepo.insert({
      hash: 'block1',
      height: 100,
      status: 'PROCEED',
      timestamp: 1705622400,
      scanner: 'ergo',
      parentHash: 'parent1',
      day: 19,
      month: 1,
      year: 2024,
    });

    await tokenPriceRepo.insert({
      tokenId: 'token1',
      price: 2.0,
      timestamp: 1705622300,
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
        bridgeFee: '10', // 10 tokens of token1 (has price)
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
        fromChain: 'cardano',
        toChain: 'ergo',
        txId: 'tx2',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        amount: '200',
        bridgeFee: '15', // 15 tokens of token2 (no price)
        networkFee: '0.2',
        sourceChainTokenId: 'token2',
        sourceChainHeight: 100,
        targetChainTokenId: 'token1',
        sourceTxId: 'sourceTx2',
        sourceBlockId: 'sourceBlock2',
        spendBlock: 'block1',
        spendHeight: 100,
        spendTxId: 'spendTx2',
        result: 'successful',
        paymentTxId: 'paymentTx2',
        WIDsCount: 1,
        WIDsHash: 'hash2',
        serialized: '{}',
      },
    ]);

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find();
    expect(bridgeFeeRecords).toHaveLength(1);

    const ergoRecord = bridgeFeeRecords[0];
    expect(ergoRecord.fromChain).toBe('ergo');
    expect(ergoRecord.amount).toBe(20); // 10 tokens * $2.0 = $20

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe('20'); // Only $20 from token1
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
    await blockRepo.insert([
      {
        hash: 'block1',
        height: 100,
        status: 'PROCEED',
        timestamp: 1705622400,
        scanner: 'ergo',
        parentHash: 'parent1',
        day: 19,
        month: 1,
        year: 2024,
      },
      {
        hash: 'block2',
        height: 101,
        status: 'PROCEED',
        timestamp: 1705622400,
        scanner: 'ergo',
        parentHash: 'parent2',
        day: 19,
        month: 1,
        year: 2024,
      },
      {
        hash: 'block3',
        height: 102,
        status: 'PROCEED',
        timestamp: 1705622400,
        scanner: 'ergo',
        parentHash: 'parent3',
        day: 19,
        month: 1,
        year: 2024,
      },
    ]);

    await tokenPriceRepo.insert({
      tokenId: 'token1',
      price: 1.0,
      timestamp: 1705622300,
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
        bridgeFee: '10',
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
        height: 101,
        extractor: 'ext2',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx2',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        amount: '200',
        bridgeFee: '20',
        networkFee: '0.2',
        sourceChainTokenId: 'token1',
        sourceChainHeight: 101,
        targetChainTokenId: 'token2',
        sourceTxId: 'sourceTx2',
        sourceBlockId: 'sourceBlock2',
        spendBlock: 'block2',
        spendHeight: 101,
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
        height: 102,
        extractor: 'ext3',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'tx3',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        amount: '300',
        bridgeFee: '30',
        networkFee: '0.3',
        sourceChainTokenId: 'token1',
        sourceChainHeight: 102,
        targetChainTokenId: 'token2',
        sourceTxId: 'sourceTx3',
        sourceBlockId: 'sourceBlock3',
        spendBlock: 'block3',
        spendHeight: 102,
        spendTxId: 'spendTx3',
        result: 'successful',
        paymentTxId: 'paymentTx3',
        WIDsCount: 1,
        WIDsHash: 'hash3',
        serialized: '{}',
      },
    ]);

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find();
    expect(bridgeFeeRecords).toHaveLength(1);

    const record = bridgeFeeRecords[0];
    expect(record.fromChain).toBe('ergo');
    expect(record.amount).toBe(60); // $10 + $20 + $30 = $60
    expect(record.lastProcessedHeight).toBe(102);

    expect(record.week).toBe(Math.floor(1705622400 / 604800));

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe('60');
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
    // Set current time to 2024-01-21 00:00:00 UTC
    vi.setSystemTime(new Date('2024-01-21T00:00:00Z')); // 1705795200

    await blockRepo.insert([
      {
        hash: 'blockDay1',
        height: 100,
        status: 'PROCEED',
        timestamp: 1705622400, // 2024-01-19 00:00:00 UTC
        scanner: 'ergo',
        parentHash: 'parentDay1',
        day: 19,
        month: 1,
        year: 2024,
      },
      {
        hash: 'blockDay2',
        height: 200,
        status: 'PROCEED',
        timestamp: 1705708800, // 2024-01-20 00:00:00 UTC
        scanner: 'ergo',
        parentHash: 'parentDay2',
        day: 20,
        month: 1,
        year: 2024,
      },
    ]);

    await tokenPriceRepo.insert({
      tokenId: 'token1',
      price: 1.0,
      timestamp: 1705622300,
    });

    await eventTriggerRepo.insert([
      {
        eventId: 'eventDay1',
        boxId: 'boxDay1',
        block: 'blockDay1',
        height: 100,
        extractor: 'ext1',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'txDay1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        amount: '100',
        bridgeFee: '10',
        networkFee: '0.1',
        sourceChainTokenId: 'token1',
        sourceChainHeight: 100,
        targetChainTokenId: 'token2',
        sourceTxId: 'sourceTx1',
        sourceBlockId: 'sourceBlock1',
        spendBlock: 'blockDay1',
        spendHeight: 100,
        spendTxId: 'spendTx1',
        result: 'successful',
        paymentTxId: 'paymentTx1',
        WIDsCount: 1,
        WIDsHash: 'hash1',
        serialized: '{}',
      },
      {
        eventId: 'eventDay2',
        boxId: 'boxDay2',
        block: 'blockDay2',
        height: 200,
        extractor: 'ext2',
        fromChain: 'ergo',
        toChain: 'cardano',
        txId: 'txDay2',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        amount: '200',
        bridgeFee: '20',
        networkFee: '0.2',
        sourceChainTokenId: 'token1',
        sourceChainHeight: 200,
        targetChainTokenId: 'token2',
        sourceTxId: 'sourceTx2',
        sourceBlockId: 'sourceBlock2',
        spendBlock: 'blockDay2',
        spendHeight: 200,
        spendTxId: 'spendTx2',
        result: 'successful',
        paymentTxId: 'paymentTx2',
        WIDsCount: 1,
        WIDsHash: 'hash2',
        serialized: '{}',
      },
    ]);

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find({
      order: { day: 'ASC' },
    });

    expect(bridgeFeeRecords).toHaveLength(2);

    const day19Record = bridgeFeeRecords.find((r) => r.day === 19);
    expect(day19Record?.amount).toBe(10);
    expect(day19Record?.lastProcessedHeight).toBe(100);

    const day20Record = bridgeFeeRecords.find((r) => r.day === 20);
    expect(day20Record?.amount).toBe(20);
    expect(day20Record?.lastProcessedHeight).toBe(200);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric?.value).toBe('30'); // $10 + $20 = $30
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
    await bridgeFeeRepo.insert({
      fromChain: 'ergo',
      day: 18,
      month: 1,
      year: 2024,
      week: 3,
      amount: 100,
      lastProcessedHeight: 999,
    });

    await bridgeFeeMetric(dataSource, logger);

    const bridgeFeeRecords = await bridgeFeeRepo.find();
    expect(bridgeFeeRecords).toHaveLength(1);

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD },
    });
    expect(metric).toBeNull();
  });
});
