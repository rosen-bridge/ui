 
import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { RosenTokens } from '@rosen-bridge/tokens';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';

import { WatcherCountConfig } from '../lib';

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
   * Test 3: Ignore events below last processed height
   * Existing last processed: 100
   * New event with spendHeight: 95 (ignored)
   * New event with spendHeight: 105 (processed)
   */
  ignoreOldEvents: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 95,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 105,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1703980800, // 2023-12-31 00:00:00 UTC
        height: 95,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC
        height: 105,
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
          lastProcessedHeight: 105,
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
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704067200, // 2024-01-01 00:00:00 UTC (before yesterday's start)
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704110400, // 2024-01-01 12:00:00 UTC (before yesterday's start)
        height: 115,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704153600, // 2024-01-02 00:00:00 UTC (yesterday's start) - excluded
        height: 120,
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
    eventTriggerRepo: [],
    blockRepo: [],
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

export const userEventTestData = {
  userEvent1: {
    fromAddress: 'addr1',
    toAddress: 'addr2',
    count: 5,
    lastProcessedHeight: 100,
  },

  userEvent2: {
    fromAddress: 'addr1',
    toAddress: 'addr3',
    count: 3,
    lastProcessedHeight: 150,
  },

  userEvent3: {
    fromAddress: 'addr2',
    toAddress: 'addr4',
    count: 2,
    lastProcessedHeight: 200,
  },

  userEvent4: {
    fromAddress: 'addr3',
    toAddress: 'addr5',
    count: 4,
    lastProcessedHeight: 180,
  },
};

export const userEventMetricTestData = {
  /**
   * Test 1: New events with different address pairs
   * - 4 events with different address combinations
   * - All successful status
   * - Timestamps before yesterday's start
   */
  newEventsDifferentAddresses: {
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
        fromAddress: 'addr5',
        toAddress: 'addr6',
        spendHeight: 120,
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({ hash: 'block1', height: 110, timestamp: 1704067200 }), // 2024-01-01 00:00:00
      createBlock({ hash: 'block2', height: 115, timestamp: 1704070800 }), // 2024-01-01 01:00:00
      createBlock({ hash: 'block3', height: 112, timestamp: 1704074400 }), // 2024-01-01 02:00:00
      createBlock({ hash: 'block4', height: 120, timestamp: 1704103200 }), // 2024-01-01 10:00:00
    ],
    expectedResults: {
      userEvents: [
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
        {
          fromAddress: 'addr5',
          toAddress: 'addr6',
          count: 1,
          lastProcessedHeight: 120,
        },
      ],
      totalMetricValue: '4',
    },
  },

  /**
   * Test 2: Update existing counts with new events
   * Existing count: 5 for addr1→addr2
   * New events: 2 more for same address pair
   */
  updateExistingCounts: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 115,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 116,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({ hash: 'block1', height: 115, timestamp: 1704081600 }), // 2024-01-01 04:00:00
      createBlock({ hash: 'block2', height: 116, timestamp: 1704085200 }), // 2024-01-01 05:00:00
    ],
    userEventRepo: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    metricRepo: [
      {
        key: METRIC_KEYS.USER_EVENT_TOTAL,
        value: '5',
        updatedAt: 1000,
      },
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          toAddress: 'addr2',
          count: 7,
          lastProcessedHeight: 116,
        },
      ],
      totalMetricValue: '7',
    },
  },

  /**
   * Test 3: Ignore events below last processed height
   * Existing last processed: 100
   * New event with spendHeight: 95 (ignored)
   * New event with spendHeight: 105 (processed)
   */
  ignoreOldEvents: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 95, // Below lastProcessedHeight - ignored
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        toAddress: 'addr2',
        spendHeight: 105, // Above lastProcessedHeight - processed
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({ hash: 'block1', height: 95, timestamp: 1703980800 }), // 2023-12-31 00:00:00
      createBlock({ hash: 'block2', height: 105, timestamp: 1704067200 }), // 2024-01-01 00:00:00
    ],
    userEventRepo: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    metricRepo: [
      {
        key: METRIC_KEYS.USER_EVENT_TOTAL,
        value: '5',
        updatedAt: 1000,
      },
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          toAddress: 'addr2',
          count: 6,
          lastProcessedHeight: 105,
        },
      ],
      totalMetricValue: '6',
    },
  },

  /**
   * Test 4: Filter events by timestamp
   * - 3 events with different timestamps
   * - 2 events with timestamps before yesterday's start
   * - 1 event with timestamp at yesterday's start (excluded)
   */
  filterByTimestamp: {
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
      createBlock({ hash: 'block1', height: 110, timestamp: 1704067200 }), // 2024-01-01 00:00:00 - included
      createBlock({ hash: 'block2', height: 115, timestamp: 1704110400 }), // 2024-01-01 12:00:00 - included
      createBlock({ hash: 'block3', height: 112, timestamp: 1704153600 }), // 2024-01-02 00:00:00 - excluded
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          toAddress: 'addr2',
          count: 2,
          lastProcessedHeight: 115,
        },
      ],
      totalMetricValue: '2',
    },
  },

  /**
   * Test 5: Filter non-successful events
   * - 2 successful events
   * - 1 fraud event (ignored)
   * - 1 null status event (ignored)
   */
  filterNonSuccessfulEvents: {
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
        result: 'fraud' as const, // Ignored - not successful
      }),
      createEventTrigger({
        eventId: 'event4',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        spendHeight: 120,
        spendBlock: null,
        result: null, // Ignored - null status
      }),
    ],
    blockRepo: [
      createBlock({ hash: 'block1', height: 110, timestamp: 1704067200 }),
      createBlock({ hash: 'block2', height: 115, timestamp: 1704070800 }),
      createBlock({ hash: 'block3', height: 112, timestamp: 1704074400 }),
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          toAddress: 'addr2',
          count: 2,
          lastProcessedHeight: 115,
        },
      ],
      totalMetricValue: '2',
    },
  },
};

/**
 * Helper to create mock box with network and count
 */
const createMockBox = (
  network: string | undefined,
  count: number,
  rwtTokenId?: string,
) => ({
  network,
  count,
  rwtTokenId,
});

export const watcherCountMetricTestData = {
  /**
   * Test 1: Multiple networks with watchers
   */
  multipleNetworks: {
    config: {
      type: 'explorer' as const,
      url: 'https://ergo-explorer.com',
      rwtTokenId: 'valid-rwt-token-id',
      watcherRegister: 5,
      rwtNetworkMap: {
        ergo: 'valid-rwt-token-id',
        cardano: 'cardano-rwt-token-id',
        ethereum: 'eth-rwt-token-id',
      },
    } as WatcherCountConfig,
    mockBoxes: [
      createMockBox('ergo', 5, 'valid-rwt-token-id'),
      createMockBox('cardano', 4, 'cardano-rwt-token-id'),
      createMockBox('ethereum', 2, 'eth-rwt-token-id'),
    ],
    expectedResults: {
      watcherCounts: [
        {
          network: 'ergo',
          count: 5,
        },
        {
          network: 'cardano',
          count: 4,
        },

        {
          network: 'ethereum',
          count: 2,
        },
      ],
      totalWatchers: '11',
    },
  },

  /**
   * Test 2: Boxes without valid network (should be skipped)
   */
  boxesWithoutValidNetwork: {
    config: {
      type: 'explorer' as const,
      url: 'https://ergo-explorer.com',
      rwtTokenId: 'valid-rwt-token-id',
      watcherRegister: 4,
      rwtNetworkMap: {
        ergo: 'valid-rwt-token-id',
      },
    } as WatcherCountConfig,
    mockBoxes: [
      createMockBox('ergo', 5, 'valid-rwt-token-id'),
      createMockBox(undefined, 4, 'some-other-token-id'),
    ],
    expectedResults: {
      watcherCounts: [
        {
          network: 'ergo',
          count: 5,
        },
      ],
      totalWatchers: '5',
    },
  },

  /**
   * Test 3: No boxes found
   */
  noBoxesFound: {
    config: {
      type: 'explorer' as const,
      url: 'https://ergo-explorer.com',
      rwtTokenId: 'valid-rwt-token-id',
      watcherRegister: 4,
      rwtNetworkMap: {
        ergo: 'valid-rwt-token-id',
      },
    } as WatcherCountConfig,
    mockBoxes: [],
    expectedResults: {
      watcherCounts: [],
      totalWatchers: 0,
    },
  },

  /**
   * Test 4: Node client configuration
   */
  nodeClientConfig: {
    config: {
      type: 'node' as const,
      url: 'https://ergo-node.com',
      rwtTokenId: 'valid-rwt-token-id',
      watcherRegister: 4,
      rwtNetworkMap: {
        ergo: 'valid-rwt-token-id',
        cardano: 'valid-rwt-token-id-2',
      },
    } as WatcherCountConfig,
    mockBoxes: [
      createMockBox('ergo', 5, 'valid-rwt-token-id'),
      createMockBox('cardano', 3, 'valid-rwt-token-id-2'),
    ],
    expectedResults: {
      watcherCounts: [
        {
          network: 'ergo',
          count: 5,
        },
        {
          network: 'cardano',
          count: 3,
        },
      ],
      totalWatchers: '8',
    },
  },
};
