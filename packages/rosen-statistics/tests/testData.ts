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

export const eventCountTestData = {
  /**
   * Test 1: New events within timestamp range
   * - 6 events that 4 events of them are valid (in range)
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
      createEventTrigger({
        eventId: 'event5',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 121,
        spendBlock: 'block5',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event6',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 841,
        spendBlock: 'block6',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704067200,
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704070800,
        height: 111,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704074400,
        height: 112,
      }),
      createBlock({
        hash: 'block4',
        timestamp: 1704103400,
        height: 120,
      }),
      createBlock({
        hash: 'block5',
        timestamp: 1704103500,
        height: 121,
      }),
      createBlock({
        hash: 'block6',
        timestamp: 1704103600,
        height: 841,
      }),
      createBlock({
        hash: 'block7',
        timestamp: 1704103800,
        height: 843,
        status: 'PROCESSING',
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
   * New events: 2 more successful ergo→cardano in valid range
   */
  updateExistingCounts: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event0',
        fromChain: 'ergo',
        toChain: 'cardano',
        spendHeight: 100,
        spendBlock: 'block0',
        result: 'successful' as const,
      }),
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
        hash: 'block0',
        timestamp: 1704081100,
        height: 100,
      }),
      createBlock({
        hash: 'block1',
        timestamp: 1704081600,
        height: 115,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704085200,
        height: 116,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704085400,
        height: 837,
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
        timestamp: 1704067200,
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704067260,
        height: 111,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704067320,
        height: 112,
      }),
      createBlock({
        hash: 'block4',
        timestamp: 1704069320,
        height: 833,
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

export const userEventMetricTestData = {
  /**
   * Test 1: New events with different address and chain pairs
   * - 6 events with different address and chaain combinations
   * - All successful status
   * - lastProcessedHeight = 0, untilProcessedHeight = 121 => 4 events are valid
   * - Events with height > 121 should be ignored
   */
  newEventsDifferentAddresses: {
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
        fromAddress: 'addr4',
        fromChain: 'bitcoin',
        toAddress: 'addr3',
        toChain: 'binance',
        spendHeight: 111,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 112,
        spendBlock: 'block3',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event4',
        fromAddress: 'addr3',
        fromChain: 'cardano',
        toAddress: 'addr4',
        toChain: 'ergo',
        spendHeight: 120,
        spendBlock: 'block4',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event5',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        spendHeight: 121,
        spendBlock: 'block5',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event6',
        fromAddress: 'addr5',
        toAddress: 'addr6',
        spendHeight: 841,
        spendBlock: 'block6',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704067200,
        height: 110,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704070800,
        height: 111,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704074400,
        height: 112,
      }),
      createBlock({
        hash: 'block4',
        timestamp: 1704103400,
        height: 120,
      }),
      createBlock({
        hash: 'block5',
        timestamp: 1704103500,
        height: 121,
      }),
      createBlock({
        hash: 'block6',
        timestamp: 1704103600,
        height: 841,
      }),
      createBlock({
        hash: 'block7',
        timestamp: 1704103800,
        height: 843,
        status: 'PROCESSING',
      }),
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          fromChain: 'ergo',
          toAddress: 'addr2',
          toChain: 'cardano',
          count: 2,
          lastProcessedHeight: 112,
        },
        {
          fromAddress: 'addr3',
          fromChain: 'cardano',
          toAddress: 'addr4',
          toChain: 'ergo',
          count: 1,
          lastProcessedHeight: 120,
        },
        {
          fromAddress: 'addr4',
          fromChain: 'bitcoin',
          toAddress: 'addr3',
          toChain: 'binance',
          count: 1,
          lastProcessedHeight: 111,
        },
      ],
      totalMetricValue: '3',
    },
  },

  /**
   * Test 2: Update existing counts with new events
   * - Existing count: 5 for addr1→addr2 at height 100
   * - New events: 2 more for same address pair (heights 115, 116)
   * - lastProcessedHeight = 100, untilProcessedHeight = 116 => 2 events are valid
   */
  updateExistingCounts: {
    eventTriggerRepo: [
      createEventTrigger({
        eventId: 'event1',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 115,
        spendBlock: 'block1',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event2',
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        spendHeight: 116,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
    ],
    blockRepo: [
      createBlock({
        hash: 'block1',
        timestamp: 1704081600,
        height: 115,
      }),
      createBlock({
        hash: 'block2',
        timestamp: 1704085200,
        height: 116,
      }),
      createBlock({
        hash: 'block3',
        timestamp: 1704085400,
        height: 837,
      }),
    ],
    userEventRepo: [
      {
        fromAddress: 'addr1',
        fromChain: 'ergo',
        toAddress: 'addr2',
        toChain: 'cardano',
        count: 5,
        lastProcessedHeight: 100,
      },
    ],
    metricRepo: [
      {
        key: METRIC_KEYS.USER_COUNT_TOTAL,
        value: '1',
        updatedAt: 1000,
      },
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          fromChain: 'ergo',
          toAddress: 'addr2',
          toChain: 'cardano',
          count: 7,
          lastProcessedHeight: 116,
        },
      ],
      totalMetricValue: '1',
    },
  },

  /**
   * Test 3: Filter non-successful events
   * - 2 successful events (addr1→addr2 at heights 110, 112)
   * - 1 fraud event (ignored)
   * - 1 null status event (ignored)
   * - lastProcessedHeight = 0, untilProcessedHeight = 112 => 2 events are valid
   */
  filterNonSuccessfulEvents: {
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
        spendHeight: 112,
        spendBlock: 'block2',
        result: 'successful' as const,
      }),
      createEventTrigger({
        eventId: 'event3',
        fromAddress: 'addr3',
        fromChain: 'bitcoin',
        toAddress: 'addr4',
        toChain: 'binance',
        spendHeight: 115,
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
      createBlock({ hash: 'block2', height: 112, timestamp: 1704070800 }),
      createBlock({ hash: 'block3', height: 115, timestamp: 1704074400 }),
      createBlock({ hash: 'block4', height: 836, timestamp: 1704079400 }),
    ],
    expectedResults: {
      userEvents: [
        {
          fromAddress: 'addr1',
          fromChain: 'ergo',
          toAddress: 'addr2',
          toChain: 'cardano',
          count: 2,
          lastProcessedHeight: 112,
        },
      ],
      totalMetricValue: '1',
    },
  },
};
