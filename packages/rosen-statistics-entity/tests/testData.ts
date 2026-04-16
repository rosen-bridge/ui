import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';

import {
  METRIC_KEYS,
  EventCountStatus,
  WatcherCountType,
  BridgeFeeEntity,
  BridgeMetricRecord,
  MetricEntity,
} from '../lib';

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
  parentHash: `parent-${Math.random()}`,
  status: PROCEED,
  scanner: 'ergo',
  timestamp: 1704153600,
  year: 2024,
  month: 1,
  day: 2,
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

export const lockedAssetsMetricActionTestData = {
  /**
   * Scenario: Get locked assets with multiple tokens
   * - 3 tokens with different significantDecimals
   * - Multiple locked assets for each token
   */
  getLockedAssetsMultipleTokens: {
    tokens: [
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 8,
        significantDecimal: 8,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 6,
        significantDecimal: 6,
        isNative: false,
        chain: 'cardano' as const,
        ergoSideTokenId: 'cardano-token-1',
        isResident: true,
      },
      {
        id: 'token-3',
        name: 'Token 3',
        decimal: 18,
        significantDecimal: 18,
        isNative: true,
        chain: 'ethereum' as const,
        ergoSideTokenId: 'eth-token-1',
        isResident: false,
      },
      {
        id: 'token-4',
        name: 'Token 4',
        decimal: 0,
        significantDecimal: 0,
        isNative: true,
        chain: 'bitcoin' as const,
        ergoSideTokenId: 'btc-token-1',
        isResident: true,
      },
    ],
    lockedAssets: [
      { address: 'addr1', tokenId: 'token-1', amount: 1000n },
      { address: 'addr2', tokenId: 'token-1', amount: 2000n },
      { address: 'addr3', tokenId: 'token-1', amount: 1500n },
      { address: 'addr4', tokenId: 'token-2', amount: 500n },
      { address: 'addr5', tokenId: 'token-2', amount: 500n },
      { address: 'addr6', tokenId: 'token-3', amount: 1000000n },
      { address: 'addr7', tokenId: 'token-4', amount: 9223372036854775807n }, // Max safe integer
    ],
    expectedResults: [
      { tokenId: 'token-1', amount: 1000n, significantDecimal: 8 },
      { tokenId: 'token-1', amount: 2000n, significantDecimal: 8 },
      { tokenId: 'token-1', amount: 1500n, significantDecimal: 8 },
      { tokenId: 'token-2', amount: 500n, significantDecimal: 6 },
      { tokenId: 'token-2', amount: 500n, significantDecimal: 6 },
      { tokenId: 'token-3', amount: 1000000n, significantDecimal: 18 },
      {
        tokenId: 'token-4',
        amount: 9223372036854775808n,
        significantDecimal: 0,
      },
    ],
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
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 5,
        lastProcessedHeight: 100,
      },
      {
        fromAddress: 'addr3',
        fromChain: 'ergo',
        toAddress: 'addr4',
        toChain: 'cardano',
        count: 2,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr5',
        fromChain: 'ergo',
        toAddress: 'addr6',
        toChain: 'cardano',
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
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 101, // Included (> 100)
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 115, // Included (> 100, < 120)
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        fromChain: 'bitcoin',
        toAddress: 'addr4',
        toChain: 'binance',
        spendHeight: 112, // Included (> 100, < 120)
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 99, // Below lastProcessedHeight - ignored (not > 100)
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromAddress: 'addr5',
        fromChain: 'ergo',
        toAddress: 'addr6',
        toChain: 'cardano',
        spendHeight: 120, // Equal to untilProcessedHeight - ignored (not < 120)
        spendBlock: 'block5',
        result: 'fraud' as const, // Different status - ignored (only successful)
      }),
      createEventTrigger({
        eventId: 'event6',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 100, // Equal to lastProcessedHeight - ignored (not > 100)
        spendBlock: 'block6',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event7',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 101, // Duplicate address pair in same height - inclulde
        spendBlock: 'block7',
        result: 'successful' as const,
      }),
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 3, // events at heights 101 and 115
        lastProcessedHeight: 115,
      },
      {
        fromAddress: 'addr3',
        fromChain: 'bitcoin',
        toAddress: 'addr4',
        toChain: 'binance',
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
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 110,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 115,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 120,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
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
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 150, // Below lastProcessedHeight
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
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
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 110, // Included (< 115)
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 115, // Equal to untilProcessedHeight - excluded (not < 115)
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        fromChain: 'bitcoin',
        toAddress: 'addr2',
        toChain: 'binance',
        spendHeight: 120, // Above untilProcessedHeight - excluded
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    expectedAggregated: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
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
    fromChain: 'ergo',
    toAddress: 'addr2',
    toChain: 'cardano',
    userEventRepo: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
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
    fromChain: 'ergo',
    toAddress: 'addr2',
    toChain: 'ergo',
    userEventRepo: [
      {
        fromAddress: 'addr1',
        fromChain: 'cardano',
        toAddress: 'addr2',
        toChain: 'ergo',
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
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 3,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        fromChain: 'ergo',
        toAddress: 'addr4',
        toChain: 'cardano',
        count: 1,
        lastProcessedHeight: 115,
      },
    ],
    existingMetric: null,
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 3,
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr3',
        fromChain: 'ergo',
        toAddress: 'addr4',
        toChain: 'cardano',
        count: 1,
        lastProcessedHeight: 115,
      },
    ],
    expectedMetricValue: '2',
  },

  /**
   * Scenario: Upsert events count
   * - Update existing user events (UPSERT replaces the entire record)
   */
  upsertEventsCountUpdateExisting: {
    aggregatedUsersEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 2, // This is the NEW count, not incremental
        lastProcessedHeight: 130,
      },
    ],
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 5, // Old count - will be replaced
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.USER_COUNT_TOTAL,
      value: '1',
      updatedAt: 1000,
    },
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 2, // Replaced with new count
        lastProcessedHeight: 130,
      },
    ],
    expectedMetricValue: '1',
  },

  /**
   * Scenario: Upsert events count
   * - Mixed new and existing groups
   */
  upsertEventsCountMixedGroups: {
    aggregatedUsersEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 3, // New count for existing group
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr1',
        fromChain: 'cardano',
        toAddress: 'addr2',
        toChain: 'ergo',
        count: 2, // New group
        lastProcessedHeight: 115,
      },
    ],
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 5, // Old count - will be replaced
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.USER_COUNT_TOTAL,
      value: '1',
      updatedAt: 1000,
    },
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 3, // Replaced with new count
        lastProcessedHeight: 120,
      },
      {
        fromAddress: 'addr1',
        fromChain: 'cardano',
        toAddress: 'addr2',
        toChain: 'ergo',
        count: 2,
        lastProcessedHeight: 115,
      },
    ],
    expectedMetricValue: '2',
  },

  /**
   * Scenario: Upsert events count
   * - Empty aggregated events array (only update total metric)
   */
  upsertEventsCountEmpty: {
    aggregatedUsersEvents: [],
    existingUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    existingMetric: {
      key: METRIC_KEYS.USER_COUNT_TOTAL,
      value: '1',
      updatedAt: 1000,
    },
    expectedUserEvents: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 5, // Unchanged
        lastProcessedHeight: 100,
      },
    ],
    expectedMetricValue: '1',
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

export const bridgeMetricsActionTestData = {
  /**
   * Scenario: Get last processed record with multiple records
   */
  getLastProcessedHeightMultipleRecords: {
    bridgeFeeRepo: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 100,
      },
      {
        fromChain: 'cardano',
        amount: 20.75,
        day: 3,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 150,
      },
      {
        fromChain: 'ergo',
        amount: 15.25,
        day: 4,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 200,
      },
    ] as BridgeFeeEntity[],
    expectedRecord: {
      fromChain: 'ergo',
      amount: 15.25,
      day: 4,
      week: 1,
      month: 1,
      year: 2024,
      lastProcessedHeight: 200,
    },
  },

  /**
   * Scenario: Get first event timestamp with multiple events
   */
  getFirstEventTimestampMultipleEvents: {
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 100,
        timestamp: 1704067200, // Jan 1, 2024 00:00:00
        day: 1,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block2',
        height: 200,
        timestamp: 1704153600, // Jan 2, 2024 00:00:00
        day: 2,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block3',
        height: 300,
        timestamp: 1704240000, // Jan 3, 2024 00:00:00
        day: 3,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
    ],
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        spendBlock: 'block2',
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event2',
        spendBlock: 'block1',
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event3',
        spendBlock: 'block3',
        result: 'successful',
      }),
    ],
    expectedTimestamp: 1704067200, // Earliest: block1 timestamp
  },

  /**
   * Scenario: Get events in range with multiple events and token decimals
   */
  getEventsInRangeMultipleEvents: {
    startTs: 1704067200, // Jan 1, 2024
    endTs: 1704240000, // Jan 3, 2024
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 100,
        timestamp: 1704067200,
        day: 1,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block2',
        height: 200,
        timestamp: 1704153600,
        day: 2,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
      createBlock({
        hash: 'block3',
        height: 300,
        timestamp: 1704240000,
        day: 3,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
    ],
    tokenRepo: [
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 8,
        significantDecimal: 8,
        isNative: true,
        chain: 'ergo',
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 6,
        significantDecimal: 6,
        isNative: false,
        chain: 'cardano',
        ergoSideTokenId: 'cardano-token-1',
        isResident: true,
      },
      {
        id: 'token-3',
        name: 'Token 3',
        decimal: 18,
        significantDecimal: 18,
        isNative: true,
        chain: 'ethereum',
        ergoSideTokenId: 'eth-token-1',
        isResident: false,
      },
      {
        id: 'token-4',
        name: 'Token 4',
        decimal: 0,
        significantDecimal: 0,
        isNative: true,
        chain: 'bitcoin',
        ergoSideTokenId: 'btc-token-1',
        isResident: true,
      },
    ] as TokenEntity[],
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        bridgeFee: '100000000', // 1 token with 8 decimals (1 * 10^8)
        sourceChainTokenId: 'token-1',
        sourceChainHeight: 50,
        spendBlock: 'block1',
        spendHeight: 100,
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'cardano',
        bridgeFee: '2000000', // 2 tokens with 6 decimals (2 * 10^6)
        sourceChainTokenId: 'token-2',
        sourceChainHeight: 150,
        spendBlock: 'block2',
        spendHeight: 200,
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'ethereum',
        bridgeFee: '3000000000000000000', // 3 tokens with 18 decimals (3 * 10^18)
        sourceChainTokenId: 'token-3',
        sourceChainHeight: 250,
        spendBlock: 'block3',
        spendHeight: 300,
        result: 'fraud', // Should be ignored
      }),
      createEventTrigger({
        eventId: 'event4',
        fromChain: 'bitcoin',
        bridgeFee: '1', // 1 token with 0 decimals (1)
        sourceChainTokenId: 'token-4',
        sourceChainHeight: 350,
        spendBlock: 'block3',
        spendHeight: 400,
        result: 'successful',
      }),
    ],
    expectedEvents: [
      {
        fromChain: 'ergo',
        bridgeFee: '100000000',
        tokenId: 'token-1',
        eventHeight: 50,
        timestamp: 1704067200,
        height: 100,
        day: 1,
        month: 1,
        year: 2024,
        decimal: 8,
      },
      {
        fromChain: 'cardano',
        bridgeFee: '2000000',
        tokenId: 'token-2',
        eventHeight: 150,
        timestamp: 1704153600,
        height: 200,
        day: 2,
        month: 1,
        year: 2024,
        decimal: 6,
      },
    ],
  },

  /**
   * Scenario: Get events in range with missing blocks
   */
  getEventsInRangeMissingBlocks: {
    startTs: 1704067200,
    endTs: 1704240000,
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 100,
        timestamp: 1704067200,
        day: 1,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
    ],
    tokenRepo: [
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 8,
        significantDecimal: 8,
        isNative: true,
        chain: 'ergo',
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
    ] as TokenEntity[],
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        bridgeFee: '100000000',
        sourceChainTokenId: 'token-1',
        sourceChainHeight: 50,
        spendBlock: 'block1',
        spendHeight: 100,
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        bridgeFee: '200000000',
        sourceChainTokenId: 'token-1',
        sourceChainHeight: 150,
        spendBlock: '',
        spendHeight: 200,
        result: 'fraud', // Should be ignored
      }),
    ],
    expectedEvents: [
      {
        fromChain: 'ergo',
        bridgeFee: '100000000',
        tokenId: 'token-1',
        eventHeight: 50,
        timestamp: 1704067200,
        height: 100,
        day: 1,
        month: 1,
        year: 2024,
        decimal: 8,
      },
    ],
  },

  /**
   * Scenario: Get events in range - no events
   */
  getEventsInRangeNoEvents: {
    startTs: 1704240000,
    endTs: 1704326400,
    blockRepo: [],
    eventTriggerRepo: [],
  },

  /**
   * Scenario: Get events in range with different token decimals
   */
  getEventsInRangeDifferentDecimals: {
    startTs: 1704067200,
    endTs: 1704240000,
    blockRepo: [
      createBlock({
        hash: 'block1',
        height: 100,
        timestamp: 1704067200,
        day: 1,
        month: 1,
        year: 2024,
        scanner: 'ergo',
      }),
    ],
    tokenRepo: [
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 8,
        significantDecimal: 8,
        isNative: true,
        chain: 'ergo',
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 6,
        significantDecimal: 6,
        isNative: false,
        chain: 'cardano',
        ergoSideTokenId: 'cardano-token-1',
        isResident: true,
      },
      {
        id: 'token-3',
        name: 'Token 3',
        decimal: 18,
        significantDecimal: 18,
        isNative: true,
        chain: 'ethereum',
        ergoSideTokenId: 'eth-token-1',
        isResident: false,
      },
      {
        id: 'token-4',
        name: 'Token 4',
        decimal: 0,
        significantDecimal: 0,
        isNative: true,
        chain: 'bitcoin',
        ergoSideTokenId: 'btc-token-1',
        isResident: true,
      },
    ] as TokenEntity[],
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        bridgeFee: '100000000', // 1 token with 8 decimals
        sourceChainTokenId: 'token-1',
        sourceChainHeight: 50,
        spendBlock: 'block1',
        spendHeight: 100,
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'cardano',
        bridgeFee: '2000000', // 2 tokens with 6 decimals
        sourceChainTokenId: 'token-2',
        sourceChainHeight: 150,
        spendBlock: 'block1',
        spendHeight: 100,
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'ethereum',
        bridgeFee: '3000000000000000000', // 3 tokens with 18 decimals
        sourceChainTokenId: 'token-3',
        sourceChainHeight: 250,
        spendBlock: 'block1',
        spendHeight: 100,
        result: 'successful',
      }),
      createEventTrigger({
        eventId: 'event4',
        fromChain: 'bitcoin',
        bridgeFee: '5', // 5 tokens with 0 decimals
        sourceChainTokenId: 'token-4',
        sourceChainHeight: 350,
        spendBlock: 'block1',
        spendHeight: 100,
        result: 'successful',
      }),
    ],
    expectedEvents: [
      {
        fromChain: 'ergo',
        bridgeFee: '100000000',
        tokenId: 'token-1',
        eventHeight: 50,
        timestamp: 1704067200,
        height: 100,
        day: 1,
        month: 1,
        year: 2024,
        decimal: 8,
      },
      {
        fromChain: 'cardano',
        bridgeFee: '2000000',
        tokenId: 'token-2',
        eventHeight: 150,
        timestamp: 1704067200,
        height: 100,
        day: 1,
        month: 1,
        year: 2024,
        decimal: 6,
      },
      {
        fromChain: 'ethereum',
        bridgeFee: '3000000000000000000',
        tokenId: 'token-3',
        eventHeight: 250,
        timestamp: 1704067200,
        height: 100,
        day: 1,
        month: 1,
        year: 2024,
        decimal: 18,
      },
      {
        fromChain: 'bitcoin',
        bridgeFee: '5',
        tokenId: 'token-4',
        eventHeight: 350,
        timestamp: 1704067200,
        height: 100,
        day: 1,
        month: 1,
        year: 2024,
        decimal: 0,
      },
    ],
  },

  /**
   * Scenario: Upsert bridge fees - new groups
   */
  saveBridgeFeesNewGroups: {
    aggregatedBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 110,
      },
      {
        fromChain: 'cardano',
        amount: 20.75,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 120,
      },
    ] as BridgeMetricRecord[],
    totalCount: '31.25',
    expectedBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 110,
      },
      {
        fromChain: 'cardano',
        amount: 20.75,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 120,
      },
    ],
    expectedMetricValue: '31.25',
  },

  /**
   * Scenario: Upsert bridge fees - update existing total
   */
  saveBridgeFeesUpdateExisting: {
    aggregatedBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 15.25,
        day: 3,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 125,
      },
    ] as BridgeMetricRecord[],
    totalCount: '15.25',
    existingBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 110,
      },
    ] as BridgeFeeEntity[],
    existingMetric: {
      key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
      value: '10.5',
      updatedAt: 1000,
    } as MetricEntity,
    expectedBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 110,
      },
      {
        fromChain: 'ergo',
        amount: 15.25,
        day: 3,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 125,
      },
    ],
    expectedMetricValue: '15.25',
  },

  /**
   * Scenario: Upsert bridge fees - multiple groups with different dates
   */
  saveBridgeFeesDifferentDates: {
    aggregatedBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 110,
      },
      {
        fromChain: 'ergo',
        amount: 15.25,
        day: 3,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 210,
      },
      {
        fromChain: 'cardano',
        amount: 20.75,
        day: 4,
        week: 2,
        month: 1,
        year: 2024,
        lastProcessedHeight: 310,
      },
    ] as BridgeMetricRecord[],
    totalCount: '46.5',
    expectedBridgeFees: [
      {
        fromChain: 'ergo',
        amount: 10.5,
        day: 2,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 110,
      },
      {
        fromChain: 'ergo',
        amount: 15.25,
        day: 3,
        week: 1,
        month: 1,
        year: 2024,
        lastProcessedHeight: 210,
      },
      {
        fromChain: 'cardano',
        amount: 20.75,
        day: 4,
        week: 2,
        month: 1,
        year: 2024,
        lastProcessedHeight: 310,
      },
    ],
    expectedMetricValue: '46.5',
  },
};
