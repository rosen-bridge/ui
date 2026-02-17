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
   * - New events from height 100 up to height 130
   * - Multiple groups with different statuses
   */
  getAggregatedEventsMultipleGroups: {
    lastProcessedHeight: 100,
    untilProcessedHeight: 130,
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
        spendHeight: 101,
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 99, // Below lastProcessedHeight - should be ignored
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 120,
        result: null, // null - should be ignored
      }),
      createEventTrigger({
        eventId: 'event6',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 130, // - should be ignored
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event7',
        fromChain: 'ethereum',
        toChain: 'ergo',
        spendHeight: 132, //  - should be ignored
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event8',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 100, // Equal lastProcessedHeight - should be ignored
        result: 'successful' as const,
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
        lastProcessedHeight: 101,
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
    untilProcessedHeight: 1100,
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
    lastProcessedHeight: 100,
    untilProcessedHeight: 121,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event0',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 100,
        result: 'successful' as const,
      }),
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
   * - Test boundary conditions:
   *   - spendHeight > lastProcessedHeight (exclusive)
   *   - spendHeight < untilProcessedHeight (exclusive)
   */
  getAggregatedEventsMultipleAddresses: {
    lastProcessedHeight: 100,
    untilProcessedHeight: 120,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 101, // Included (> 100)
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 115, // Included (> 100, < 120)
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        spendHeight: 112, // Included (> 100, < 120)
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 99, // Below lastProcessedHeight - ignored (not > 100)
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        spendHeight: 120, // Equal to untilProcessedHeight - ignored (not < 120)
        spendBlock: 'block5',
        result: 'fraud' as const, // Different status - ignored (only successful)
      }),
      createEventTrigger({
        eventId: 'event6',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 100, // Equal to lastProcessedHeight - ignored (not > 100)
        spendBlock: 'block6',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event7',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 101, // Duplicate address pair in same height - inclulde
        spendBlock: 'block7',
        result: 'successful' as const,
      }),
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3, // events at heights 101 and 115
        lastProcessedHeight: 115,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 1, // event at height 112
        lastProcessedHeight: 112,
      },
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - Single address pair with multiple events
   * - Test proper aggregation of count and max height
   */
  getAggregatedEventsSameAddress: {
    lastProcessedHeight: 100,
    untilProcessedHeight: 130,
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
   * - No events since last height (all below or equal)
   */
  getAggregatedEventsNoNewEvents: {
    lastProcessedHeight: 200,
    untilProcessedHeight: 300,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 150, // Below lastProcessedHeight
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 200, // Equal to lastProcessedHeight - ignored
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
    ],
  },

  /**
   * Scenario: Get aggregated events
   * - Events with spendHeight at or above untilProcessedHeight
   */
  getAggregatedEventsExcludeByHeight: {
    lastProcessedHeight: 100,
    untilProcessedHeight: 115,
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 110, // Included (< 115)
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 115, // Equal to untilProcessedHeight - excluded (not < 115)
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        toAddress: 'addr4',
        spendHeight: 120, // Above untilProcessedHeight - excluded
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 1,
        lastProcessedHeight: 110,
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
   * - Update existing user events (UPSERT replaces the entire record)
   */
  upsertEventsCountUpdateExisting: {
    aggregatedUsersEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 2, // This is the NEW count, not incremental
        lastProcessedHeight: 130,
      },
    ],
    totalCount: 7, // New total count
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5, // Old count - will be replaced
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
        count: 2, // Replaced with new count
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
        count: 3, // New count for existing group
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        count: 2, // New group
        lastProcessedHeight: 115,
      },
    ],
    totalCount: 10,
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5, // Old count - will be replaced
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
        count: 3, // Replaced with new count
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
   * - Empty aggregated events array (only update total metric)
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
        count: 5, // Unchanged
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
