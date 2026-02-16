import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { RosenTokens } from '@rosen-bridge/tokens';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';

export const tokenMapData: RosenTokens = [
  {
    ergo: {
      tokenId:
        '1111111111111111111111111111111111111111111111111111111111111111',
      extra: {},
      name: 'test token1',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset1',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId:
        '2222222222222222222222222222222222222222222222222222222222222222',
      extra: {},
      name: 'test token2',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset2',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId: 'tokenId',
      extra: {},
      name: 'test token3',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
    cardano: {
      tokenId: 'policyId3.assetName3',
      extra: {
        policyId: 'policyId3',
        assetName: 'assetName3',
      },
      name: 'asset3',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
  },
];

export const lockedAssetsTestData = {
  test1: {
    tokenRepo: [
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-2',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-1', amount: BigInt(7) },
      { address: 'addr3', tokenId: 'token-1', amount: BigInt(3) },

      { address: 'addr4', tokenId: 'token-2', amount: BigInt(5) },
      { address: 'addr5', tokenId: 'token-2', amount: BigInt(2) },
    ],
    tokenPriceRepo: [
      {
        tokenId: 'token-1',
        price: 10,
        timestamp: 2_000,
      },
      {
        tokenId: 'token-2',
        price: 4,
        timestamp: 2_000,
      },
      {
        tokenId: 'token-2',
        price: 3,
        timestamp: 3_000,
      },
    ],
  },

  test2: {
    tokenRepo: [
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      {
        address: 'addr1',
        tokenId: 'token-1',
        amount: BigInt(10),
      },
    ],
  },
};

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
  parentHash: `parent-${Math.random()}`,
  status: PROCEED,
  scanner: 'ergo',
  timestamp: 1704153600, // 2024-01-02 00:00:00 UTC (yesterday's start)
  year: 2024,
  month: 1,
  day: 2,
  ...overrides,
});

export const eventCountTestData = {
  /**
   * Test 1: New events within timestamp range
   * - 4 events with valid timestamps before yesterday's start
   * - Different status and chain combinations
   */
  newEventsTest1: {
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
        spendHeight: 111,
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
        spendHeight: 120,
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC (before yesterday's start)
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704070800, // 2024-01-01 01:00:00 UTC
        height: 111,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704074400, // 2024-01-01 02:00:00 UTC
        height: 112,
      }),
      createBlock({
        hash: 'block4',
        timestamp: 1704103200, // 2024-01-01 10:00:00 UTC
        height: 120,
      }),
    ],
    expectedResults: {
      eventCounts: [
        {
          status: 'fraud',
          fromChain: 'ergo',
          toChain: 'cardano',
          eventCount: 1,
          lastProcessedHeight: 111,
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
          eventCount: 2,
          lastProcessedHeight: 120,
        },
      ],
      totalMetricValue: '4',
    },
  },

  /**
   * Test 2: Update existing counts with new events
   * Existing count: 5 successful ergo→cardano
   * New events: 2 more successful ergo→cardano with valid timestamps
   */
  updateExistingCounts: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 115,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 116,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704081600, // 2024-01-01 04:00:00 UTC
        height: 115,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704085200, // 2024-01-01 05:00:00 UTC
        height: 116,
      }),
    ],
    eventCountRepo: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    metricRepo: [
      {
        key: METRIC_KEYS.EVENT_COUNT_TOTAL,
        value: '5',
        updatedAt: 1000,
      },
    ],
    expectedResults: {
      eventCounts: [
        {
          status: 'successful',
          fromChain: 'ergo',
          toChain: 'cardano',
          eventCount: 7,
          lastProcessedHeight: 116,
        },
      ],
      totalMetricValue: '7',
    },
  },

  /**
   * Test 3: Ignore events below or equal last processed height
   * Existing last processed: 100
   * New event with spendHeight: 99 (ignored)
   * New event with spendHeight: 100 (ignored)
   * New event with spendHeight: 101 (processed)
   */
  ignoreOldEvents: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 99,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 101,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 100,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1703980800, // 2023-12-31 00:00:00 UTC
        height: 99,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC
        height: 101,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC
        height: 100,
      }),
    ],
    eventCountRepo: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    metricRepo: [
      {
        key: METRIC_KEYS.EVENT_COUNT_TOTAL,
        value: '5',
        updatedAt: 1000,
      },
    ],
    expectedResults: {
      eventCounts: [
        {
          status: 'successful',
          fromChain: 'ergo',
          toChain: 'cardano',
          eventCount: 6,
          lastProcessedHeight: 101,
        },
      ],
      totalMetricValue: '6',
    },
  },

  /**
   * Test 4: Filter events by timestamp
   * - 3 events with different timestamps
   * - 2 events with timestamps before yesterday's start
   * - 1 event with timestamp at yesterday's start (should be excluded)
   */
  filterByTimestamp: {
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
      createEventTrigger({
        eventId: 'event4',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 119,
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC (before yesterday's start)
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704153599, // 2024-01-01 23:59:59 UTC (before yesterday's start)
        height: 115,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704153600, // 2024-01-02 00:00:00 UTC (yesterday's start) - excluded
        height: 120,
      }),
      createBlock({
        hash: 'block4',
        timestamp: 1704153601, // 2024-01-02 00:00:01 UTC (after yesterday's start) - excluded
        height: 119,
      }),
    ],
    expectedResults: {
      eventCounts: [
        {
          status: 'successful',
          fromChain: 'ergo',
          toChain: 'cardano',
          eventCount: 2,
          lastProcessedHeight: 115,
        },
      ],
      totalMetricValue: '2',
    },
  },

  /**
   * Test 5: No new events
   * Only existing data, no new events
   */
  noNewEvents: {
    eventCountRepo: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        lastProcessedHeight: 100,
      },
    ],
    metricRepo: [
      {
        key: METRIC_KEYS.EVENT_COUNT_TOTAL,
        value: '5',
        updatedAt: 1000,
      },
    ],
    expectedResults: {
      eventCounts: [
        {
          status: 'successful',
          fromChain: 'ergo',
          toChain: 'cardano',
          eventCount: 5,
          lastProcessedHeight: 100,
        },
      ],
      totalMetricValue: '5',
    },
  },

  /**
   * Test 6: Filter null status events
   * 2 successful + 1 null status - only successful should be counted
   */
  filterNullStatusEvents: {
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
        spendHeight: 111,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 112,
        spendBlock: 'block3',
        result: null,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704067260, // 2024-01-01 00:01:00 UTC
        height: 111,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704067320, // 2024-01-01 00:02:00 UTC
        height: 112,
      }),
    ],
    expectedResults: {
      eventCounts: [
        {
          status: 'successful',
          fromChain: 'ergo',
          toChain: 'cardano',
          eventCount: 2,
          lastProcessedHeight: 111,
        },
      ],
      totalMetricValue: '2',
    },
  },
};
