import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS, EventCountStatus } from '../lib';

/**
 * Helper function to create minimal EventTriggerEntity for testing
 */
const createEventTrigger = (
  overrides: Partial<EventTriggerEntity>,
): DeepPartial<EventTriggerEntity> => ({
  eventId: 'event',
  identifier: `box-${Math.random()}`,
  block: `block-${Math.random()}`,
  height: 100,
  extractor: `ext-${Math.random()}`,
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
  spendTxId: 'spendTx1',
  paymentTxId: 'paymentTx1',
  WIDsCount: 1,
  WIDsHash: 'hash1',
  serialized: '{}',
  ...overrides,
});

/**
 * Helper function to create minimal BlockEntity for testing
 */
const createBlock = (
  overrides: Partial<BlockEntity>,
): DeepPartial<BlockEntity> => ({
  id: Math.floor(Math.random() * 10000),
  height: 100,
  hash: 'block1',
  parentHash: 'parent-block-hash',
  status: PROCEED,
  scanner: 'ergo',
  timestamp: 1000000,
  year: 2024,
  month: 1,
  day: 1,
  ...overrides,
});

export const eventCountMetricActionTestData = {
  /**
   * Scenario: Get last processed height
   * - No existing records
   */
  getLastProcessedHeightNoRecords: {
    expectedHeight: 0,
  },

  /**
   * Scenario: Get last processed height
   * - Multiple records with different heights
   */
  getLastProcessedHeightMultipleRecords: {
    eventCountRepo: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
      {
        status: 'fraud' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 2,
        lastProcessedHeight: 120,
      },
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 3,
        lastProcessedHeight: 150,
      },
    ],
    expectedHeight: 150,
  },

  /**
   * Scenario: Get aggregated events
   * - New events from height 100 up to timestamp 2000000
   * - Multiple groups with different statuses
   */
  getAggregatedEventsMultipleGroups: {
    lastProcessedHeight: 100,
    untilTimestamp: 2000000,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 110,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 115,
        spendBlock: 'block2',
        result: 'fraud' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'cardano',
        toChain: 'ergo',
        spendHeight: 112,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 90, // Below lastProcessedHeight - should be ignored
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 120,
        spendBlock: 'block5',
        result: null, // null - should be ignored
      }),
      createEventTrigger({
        eventId: 'event6',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 130,
        spendBlock: 'block6',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event7',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 132,
        spendBlock: 'block7',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1999999,
        height: 110,
        parentHash: 'parent1',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1600000,
        height: 115,
        parentHash: 'parent2',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1550000,
        height: 112,
        parentHash: 'parent3',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block4',
        timestamp: 1400000,
        height: 90,
        parentHash: 'parent4',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block5',
        timestamp: 1700000,
        height: 120,
        parentHash: 'parent5',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block6',
        timestamp: 2000000, // should be ignored
        height: 130,
        parentHash: 'parent6',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block7',
        timestamp: 2000001, // should be ignored
        height: 132,
        parentHash: 'parent7',
        status: PROCEED,
        scanner: 'ergo',
      }),
    ],
    expectedAggregated: [
      {
        status: 'fraud',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        lastProcessedHeight: 115,
      },
      {
        status: 'successful',
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 1,
        lastProcessedHeight: 112,
      },
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        lastProcessedHeight: 110,
      },
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - No new events since last height
   */
  getAggregatedEventsNoNewEvents: {
    lastProcessedHeight: 200,
    untilTimestamp: 2000000,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 150,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 180,
        spendBlock: 'block2',
        result: 'fraud' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1500000,
        height: 150,
        parentHash: 'parent1',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1600000,
        height: 180,
        parentHash: 'parent2',
        status: PROCEED,
        scanner: 'ergo',
      }),
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - Multiple events in same group
   */
  getAggregatedEventsSameGroup: {
    lastProcessedHeight: 100,
    untilTimestamp: 2000000,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 110,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 115,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 120,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1500000,
        height: 110,
        parentHash: 'parent1',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1600000,
        height: 115,
        parentHash: 'parent2',
        status: PROCEED,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1700000,
        height: 120,
        parentHash: 'parent3',
        status: PROCEED,
        scanner: 'ergo',
      }),
    ],
    expectedAggregated: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
      },
    ],
  },

  /**
   * Scenario: Get existing event count
   * - Record exists
   */
  getExistingEventCountExists: {
    status: 'successful' as EventCountStatus,
    fromChain: 'ergo',
    toChain: 'cardano',
    eventCountRepo: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 10,
        lastProcessedHeight: 200,
      },
    ],
    expectedCount: 10,
  },

  /**
   * Scenario: Get existing event count
   * - Record does not exist
   */
  getExistingEventCountNotExists: {
    status: 'fraud' as EventCountStatus,
    fromChain: 'ergo',
    toChain: 'cardano',
    eventCountRepo: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 10,
        lastProcessedHeight: 200,
      },
    ],
    expectedCount: 0,
  },

  /**
   * Scenario: Upsert events count
   * - New groups, no existing records
   */
  upsertEventsCountNewGroups: {
    aggregatedEvents: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
      },
      {
        status: 'fraud' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        lastProcessedHeight: 115,
      },
    ],
    totalCount: 4,
    existingMetric: null,
    expectedEventCounts: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
      },
      {
        status: 'fraud',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        lastProcessedHeight: 115,
      },
    ],
    expectedMetricValue: '4',
  },

  /**
   * Scenario: Upsert events count
   * - Update existing groups
   */
  upsertEventsCountUpdateExisting: {
    aggregatedEvents: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 2,
        lastProcessedHeight: 130,
      },
    ],
    totalCount: 7,
    existingEventCounts: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.EVENT_COUNT_TOTAL,
      value: '5',
      updatedAt: 1000,
    },
    expectedEventCounts: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 2,
        lastProcessedHeight: 130,
      },
    ],
    expectedMetricValue: '7',
  },

  /**
   * Scenario: Upsert events count
   * - Multiple groups including both new and existing
   */
  upsertEventsCountMixedGroups: {
    aggregatedEvents: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
      },
      {
        status: 'fraud' as EventCountStatus,
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 2,
        lastProcessedHeight: 115,
      },
    ],
    totalCount: 10,
    existingEventCounts: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.EVENT_COUNT_TOTAL,
      value: '5',
      updatedAt: 1000,
    },
    expectedEventCounts: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
      },
      {
        status: 'fraud',
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 2,
        lastProcessedHeight: 115,
      },
    ],
    expectedMetricValue: '10',
  },

  /**
   * Scenario: Upsert events count
   * - Empty aggregated events array
   */
  upsertEventsCountEmpty: {
    aggregatedEvents: [],
    totalCount: 5,
    existingEventCounts: [
      {
        status: 'successful' as EventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.EVENT_COUNT_TOTAL,
      value: '5',
      updatedAt: 1000,
    },
    expectedEventCounts: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    expectedMetricValue: '5',
  },
};
