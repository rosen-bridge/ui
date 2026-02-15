import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS, EventCountStatus, WatcherCountType } from '../lib';

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
  fromChain: 'ergo',
  toChain: 'cardano',
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
    expectedAggregated: [],
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

export const userEventTestData = {
  addr1ToAddr2: {
    fromAddress: 'addr1',
    toAddress: 'addr2',
    count: 5,
    lastProcessedHeight: 100,
  },

  addr1ToAddr3: {
    fromAddress: 'addr1',
    toAddress: 'addr3',
    count: 3,
    lastProcessedHeight: 150,
  },

  addr2ToAddr4: {
    fromAddress: 'addr2',
    toAddress: 'addr4',
    count: 2,
    lastProcessedHeight: 200,
  },

  addr3ToAddr5: {
    fromAddress: 'addr3',
    toAddress: 'addr5',
    count: 4,
    lastProcessedHeight: 180,
  },

  addr5ToAddr6: {
    fromAddress: 'addr5',
    toAddress: 'addr6',
    count: 1,
    lastProcessedHeight: 220,
  },
};

export const userEventMetricActionTestData = {
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
    userEventRepo: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 2,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr5',
        toAddress: 'addr6',
        count: 3,
        lastProcessedHeight: 150,
      },
    ],
    expectedHeight: 150,
  },

  /**
   * Scenario: Get aggregated events
   * - Multiple events from different addresses
   * - All successful status
   * - With valid timestamps
   */
  getAggregatedEventsMultipleAddresses: {
    lastProcessedHeight: 100,
    untilTimestamp: 1704153600, // 2024-01-02 00:00:00 UTC
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 110,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 115,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        spendHeight: 112,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 90, // Below lastProcessedHeight - ignored
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        spendHeight: 120,
        spendBlock: 'block5',
        result: 'fraud' as const, // Different status - ignored (only successful)
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 110,
        parentHash: 'parent1',
        timestamp: 1704067200,
      }), // 2024-01-01 00:00:00
      createBlock({
        hash: 'block2',
        height: 115,
        parentHash: 'parent2',
        timestamp: 1704070800,
      }), // 2024-01-01 01:00:00
      createBlock({
        hash: 'block3',
        height: 112,
        parentHash: 'parent3',
        timestamp: 1704074400,
      }), // 2024-01-01 02:00:00
      createBlock({
        hash: 'block4',
        height: 90,
        parentHash: 'parent4',
        timestamp: 1703980800,
      }), // 2023-12-31 00:00:00
      createBlock({
        hash: 'block5',
        height: 120,
        parentHash: 'parent5',
        timestamp: 1704078000,
      }), // 2024-01-01 03:00:00
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 2,
        lastProcessedHeight: 115,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 1,
        lastProcessedHeight: 112,
      },
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - Single address pair with multiple events
   */
  getAggregatedEventsSameAddress: {
    lastProcessedHeight: 100,
    untilTimestamp: 1704153600,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 110,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 115,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 120,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 110,
        parentHash: 'parent1',
        timestamp: 1704067200,
      }),
      createBlock({
        hash: 'block2',
        height: 115,
        parentHash: 'parent2',
        timestamp: 1704070800,
      }),
      createBlock({
        hash: 'block3',
        height: 120,
        parentHash: 'parent3',
        timestamp: 1704074400,
      }),
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3,
        lastProcessedHeight: 120,
      },
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - No events since last height
   */
  getAggregatedEventsNoNewEvents: {
    lastProcessedHeight: 200,
    untilTimestamp: 1704153600,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 150,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 150,
        parentHash: 'parent1',
        timestamp: 1704067200,
      }),
    ],
    expectedAggregated: [],
  },

  /**
   * Scenario: Get aggregated events
   * - Events with timestamps after untilTimestamp
   */
  getAggregatedEventsExcludeByTimestamp: {
    lastProcessedHeight: 100,
    untilTimestamp: 1704074400, // 2024-01-01 02:00:00 UTC
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 110,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 115,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        spendHeight: 112,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 110,
        parentHash: 'parent1',
        timestamp: 1704067200,
      }), // Before - included
      createBlock({
        hash: 'block2',
        height: 115,
        parentHash: 'parent2',
        timestamp: 1704078000,
      }), // After - excluded
      createBlock({
        hash: 'block3',
        height: 112,
        parentHash: 'parent3',
        timestamp: 1704070800,
      }), // Before - included
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 1,
        lastProcessedHeight: 110,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 1,
        lastProcessedHeight: 112,
      },
    ],
  },

  /**
   * Scenario: Get existing user event
   * - Record exists
   */
  getExistingUserEventExists: {
    fromAddress: 'addr1',
    toAddress: 'addr2',
    userEventRepo: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 10,
        lastProcessedHeight: 200,
      },
    ],
    expectedCount: 10,
  },

  /**
   * Scenario: Get existing user event
   * - Record does not exist
   */
  getExistingUserEventNotExists: {
    fromAddress: 'addr1',
    toAddress: 'addr2',
    userEventRepo: [
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 10,
        lastProcessedHeight: 200,
      },
    ],
    expectedCount: 0,
  },

  /**
   * Scenario: Upsert events count
   * - New user events, no existing records
   */
  upsertEventsCountNewGroups: {
    aggregatedUsersEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 1,
        lastProcessedHeight: 115,
      },
    ],
    totalCount: 4,
    existingMetric: null,
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 1,
        lastProcessedHeight: 115,
      },
    ],
    expectedMetricValue: '4',
  },

  /**
   * Scenario: Upsert events count
   * - Update existing user events
   */
  upsertEventsCountUpdateExisting: {
    aggregatedUsersEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 2,
        lastProcessedHeight: 130,
      },
    ],
    totalCount: 7,
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.USER_EVENT_TOTAL,
      value: '5',
      updatedAt: 1000,
    },
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 2,
        lastProcessedHeight: 130,
      },
    ],
    expectedMetricValue: '7',
  },

  /**
   * Scenario: Upsert events count
   * - Mixed new and existing groups
   */
  upsertEventsCountMixedGroups: {
    aggregatedUsersEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 2,
        lastProcessedHeight: 115,
      },
    ],
    totalCount: 10,
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.USER_EVENT_TOTAL,
      value: '5',
      updatedAt: 1000,
    },
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 2,
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
    aggregatedUsersEvents: [],
    totalCount: 5,
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.USER_EVENT_TOTAL,
      value: '5',
      updatedAt: 1000,
    },
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    expectedMetricValue: '5',
  },
};

export const watcherCountTestData = {
  ergoNetwork: {
    network: 'ergo',
    count: 50,
  },

  cardanoNetwork: {
    network: 'cardano',
    count: 30,
  },

  ethereumNetwork: {
    network: 'ethereum',
    count: 25,
  },

  binanceNetwork: {
    network: 'binance',
    count: 15,
  },

  bitcoinNetwork: {
    network: 'bitcoin',
    count: 10,
  },
};

export const getWatcherCountScenarios = {
  noMatch: {
    watcherCountRepo: [watcherCountTestData.ergoNetwork],
    query: 'cardano',
    expected: null,
  },

  multipleRecords: {
    watcherCountRepo: [
      watcherCountTestData.ergoNetwork,
      watcherCountTestData.cardanoNetwork,
      watcherCountTestData.ethereumNetwork,
    ],
    query: 'cardano',
    expected: watcherCountTestData.cardanoNetwork,
  },

  emptyDatabase: {
    query: 'ergo',
    expected: null,
  },
};

export const upsertWatcherCountScenarios = {
  insertNew: {
    upsertData: [
      {
        network: 'ergo',
        count: 50,
      },
    ] as WatcherCountType[],
    expectedCount: 1,
    expectedRecord: [
      {
        network: 'ergo',
        count: 50,
      },
    ],
  },

  updateExisting: {
    initialData: [watcherCountTestData.ergoNetwork],
    upsertData: [
      {
        network: 'ergo',
        count: 75,
      },
    ] as WatcherCountType[],
    expectedCount: 1,
    expectedRecord: [
      {
        network: 'ergo',
        count: 75,
      },
    ],
  },

  insertMultipleDifferentNetworks: {
    initialData: [
      watcherCountTestData.ergoNetwork,
      watcherCountTestData.cardanoNetwork,
    ],
    upsertData: [
      {
        network: 'ethereum',
        count: 25,
      },
    ] as WatcherCountType[],
    expectedCount: 3,
    expectedRecords: [
      {
        network: 'ergo',
        count: 50,
      },
      {
        network: 'cardano',
        count: 30,
      },
      {
        network: 'ethereum',
        count: 25,
      },
    ],
  },

  updateMultipleTimes: {
    upsertOperations: [
      {
        network: 'ergo',
        count: 10,
      },
      {
        network: 'ergo',
        count: 25,
      },
      {
        network: 'ergo',
        count: 50,
      },
    ],
    expectedCount: 1,
    expectedRecord: [
      {
        network: 'ergo',
        count: 50,
      },
    ],
  },

  updateDifferentNetworkKeepsOthers: {
    initialData: [
      watcherCountTestData.ergoNetwork,
      watcherCountTestData.cardanoNetwork,
      watcherCountTestData.ethereumNetwork,
    ],
    upsertData: {
      network: 'cardano',
      count: 45,
    },
    expectedCount: 3,
    expectedRecords: [
      watcherCountTestData.ergoNetwork,
      {
        network: 'cardano',
        count: 45,
      },
      watcherCountTestData.ethereumNetwork,
    ],
  },
};
