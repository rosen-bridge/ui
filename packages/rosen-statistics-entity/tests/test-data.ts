import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS, eventCountStatus } from '../lib';

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
        status: 'successful' as eventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
      {
        status: 'fraud' as eventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 2,
        lastProcessedHeight: 120,
      },
      {
        status: 'successful' as eventCountStatus,
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
   * - New events from height 100
   * - Multiple groups with different statuses
   */
  getAggregatedEventsMultipleGroups: {
    lastHeight: 100,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 110,
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 115,
        result: 'fraud' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'cardano',
        toChain: 'ergo',
        spendHeight: 112,
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 90, // Below lastHeight - should be ignored
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 120,
        result: null, // null - should be ignored
      }),
    ],
    expectedAggregated: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 110,
      },
      {
        status: 'fraud',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 115,
      },
      {
        status: 'successful',
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 1,
        maxHeight: 112,
      },
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - No new events since last height
   */
  getAggregatedEventsNoNewEvents: {
    lastHeight: 200,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 150,
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 180,
        result: 'fraud' as const,
      }),
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - Multiple events in same group
   */
  getAggregatedEventsSameGroup: {
    lastHeight: 100,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 110,
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 115,
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 120,
        result: 'successful' as const,
      }),
    ],
    expectedAggregated: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        maxHeight: 120,
      },
    ],
  },

  /**
   * Scenario: Get existing event count
   * - Record exists
   */
  getExistingEventCountExists: {
    status: 'successful' as eventCountStatus,
    fromChain: 'ergo',
    toChain: 'cardano',
    eventCountRepo: [
      {
        status: 'successful' as eventCountStatus,
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
    status: 'fraud' as eventCountStatus,
    fromChain: 'ergo',
    toChain: 'cardano',
    eventCountRepo: [
      {
        status: 'successful' as eventCountStatus,
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
        status: 'successful' as eventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        maxHeight: 120,
      },
      {
        status: 'fraud' as eventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 115,
      },
    ],
    totalCount: 4,
    existingMetric: null,
    expectedEventCounts: [
      {
        status: 'fraud',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        lastProcessedHeight: 115,
      },
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
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
        status: 'successful' as eventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 2,
        maxHeight: 130,
      },
    ],
    totalCount: 7,
    existingEventCounts: [
      {
        status: 'successful' as eventCountStatus,
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
        status: 'successful' as eventCountStatus,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        maxHeight: 120,
      },
      {
        status: 'fraud' as eventCountStatus,
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 2,
        maxHeight: 115,
      },
    ],
    totalCount: 10,
    existingEventCounts: [
      {
        status: 'successful' as eventCountStatus,
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
        status: 'fraud',
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 2,
        lastProcessedHeight: 115,
      },
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        lastProcessedHeight: 120,
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
        status: 'successful' as eventCountStatus,
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
