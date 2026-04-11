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
        significantDecimal: 9,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-1',
        isResident: true,
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 0,
        significantDecimal: 9,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-2',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(38499495) },
      { address: 'addr2', tokenId: 'token-1', amount: BigInt(7) },
      { address: 'addr3', tokenId: 'token-1', amount: BigInt(3) },

      { address: 'addr4', tokenId: 'token-2', amount: BigInt(1) },
      { address: 'addr5', tokenId: 'token-2', amount: BigInt(2) },
      { address: 'addr6', tokenId: 'token-2', amount: BigInt(64451890024) },
    ],
    tokenPriceRepo: [
      {
        tokenId: 'token-1',
        price: 3500,
        timestamp: 2_000,
      },
      {
        tokenId: 'token-2',
        price: 2,
        timestamp: 2_000, // This is the latest price for token-2 at calculation time
      },
      {
        tokenId: 'token-2',
        price: 3,
        timestamp: 1_000, // Should not be used
      },
    ],
    expectedTotalUsd: '263.652047554',
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

  test3: {
    tokenRepo: [
      {
        id: 'token-large',
        name: 'Large Token',
        decimal: 0,
        significantDecimal: 18,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-large',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      {
        address: 'addr1',
        tokenId: 'token-large',
        amount: 1000000000000000000n,
      },
    ],
    tokenPriceRepo: [
      {
        tokenId: 'token-large',
        price: 100000.7,
        timestamp: 2_000,
      },
    ],
    expectedTotalUsd: '100000.7',
  },

  test4: {
    tokenRepo: [
      {
        id: 'token-micro',
        name: 'Micro Token',
        decimal: 0,
        significantDecimal: 18,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-micro',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      {
        address: 'addr1',
        tokenId: 'token-micro',
        amount: BigInt('1000000000000000000'),
      }, // 1e18
    ],
    tokenPriceRepo: [
      {
        tokenId: 'token-micro',
        price: 0.000000000000001, // 1e-15
        timestamp: 2_000,
      },
    ],
    expectedTotalUsd: '0.000000000000001',
  },

  test5: {
    tokenRepo: [
      {
        id: 'token-zero',
        name: 'Zero Token',
        decimal: 0,
        significantDecimal: 9,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-zero',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-zero', amount: BigInt(0) },
    ],
    tokenPriceRepo: [
      {
        tokenId: 'token-zero',
        price: 100,
        timestamp: 2_000,
      },
    ],
    expectedTotalUsd: '0',
  },

  test6: {
    tokenRepo: [
      {
        id: 'token-dec-0',
        name: 'Token 0 decimals',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-0',
        isResident: true,
      },
      {
        id: 'token-dec-6',
        name: 'Token 6 decimals',
        decimal: 6,
        significantDecimal: 6,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-6',
        isResident: true,
      },
      {
        id: 'token-dec-18',
        name: 'Token 18 decimals',
        decimal: 18,
        significantDecimal: 18,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-18',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-dec-0', amount: BigInt(100) },
      { address: 'addr1', tokenId: 'token-dec-6', amount: BigInt(1000000) }, // 1 token with 6 decimals
      {
        address: 'addr1',
        tokenId: 'token-dec-18',
        amount: BigInt('1800000000000000000'),
      }, // 1.8 token with 18 decimals
    ],
    tokenPriceRepo: [
      { tokenId: 'token-dec-0', price: 0.2, timestamp: 2_000 },
      { tokenId: 'token-dec-6', price: 10, timestamp: 2_000 },
      { tokenId: 'token-dec-18', price: 10, timestamp: 2_000 },
    ],
    expectedTotalUsd: '48',
  },

  test7: {
    tokenRepo: [
      {
        id: 'token-with-price',
        name: 'With Price',
        decimal: 0,
        significantDecimal: 2,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-price',
        isResident: true,
      },
      {
        id: 'token-no-price',
        name: 'No Price',
        decimal: 0,
        significantDecimal: 9,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-no-price',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      {
        address: 'addr1',
        tokenId: 'token-with-price',
        amount: BigInt(45895321),
      },
      { address: 'addr1', tokenId: 'token-no-price', amount: BigInt(1000) },
    ],
    tokenPriceRepo: [
      {
        tokenId: 'token-with-price',
        price: 0.0045,
        timestamp: 2_000,
      },
    ],
    expectedTotalUsd: '2065.289445',
  },

  test8: {
    tokenRepo: [
      {
        id: 'token-time',
        name: 'Time Token',
        decimal: 0,
        significantDecimal: 4,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-time',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-time', amount: BigInt(7529654) },
    ],
    tokenPriceRepo: [
      { tokenId: 'token-time', price: 5, timestamp: 1_000 }, // Old price
      { tokenId: 'token-time', price: 1, timestamp: 2_000 }, // New price (should be used)
      { tokenId: 'token-time', price: 1.5, timestamp: 3_000 }, // Future price (not used)
    ],
    expectedTotalUsd: '1129.4481',
  },

  test9: {
    tokenRepo: [
      {
        id: 'token-sci',
        name: 'Scientific Token',
        decimal: 0,
        significantDecimal: 3,
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-sci',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-sci', amount: BigInt(2504567) },
    ],
    tokenPriceRepo: [{ tokenId: 'token-sci', price: 2.1e-8, timestamp: 2_000 }],
    expectedTotalUsd: '0.000052595907',
  },

  test10: {
    tokenRepo: [
      {
        id: 'token-mixed-1',
        name: 'Mixed Token 1',
        decimal: 0,
        significantDecimal: 2, // Only 2 significant decimals
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-mixed-1',
        isResident: true,
      },
      {
        id: 'token-mixed-2',
        name: 'Mixed Token 2',
        decimal: 0,
        significantDecimal: 8, // 8 significant decimals
        isNative: false,
        chain: 'ergo' as const,
        ergoSideTokenId: 'ergo-token-mixed-2',
        isResident: true,
      },
    ],
    lockedAssetRepo: [
      { address: 'addr1', tokenId: 'token-mixed-1', amount: BigInt(123456) },
      { address: 'addr1', tokenId: 'token-mixed-2', amount: BigInt(789012) },
    ],
    tokenPriceRepo: [
      { tokenId: 'token-mixed-1', price: 0.12345678, timestamp: 2_000 },
      { tokenId: 'token-mixed-2', price: 0.00001234, timestamp: 2_000 },
    ],
    expectedTotalUsd: '152.4148024141640808',
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

/**
 * Helper to create mock box for node
 */
const createMockNodeBox = (count: string, rwtTokenId?: string) => ({
  additionalRegisters: {
    R5: count,
  },
  assets: [
    {
      tokenId: 'test-tokenId-1',
    },
    {
      tokenId: rwtTokenId,
    },
    {
      tokenId: 'test-tokenId-2',
    },
  ],
});

export const watcherCountMetricTestData = {
  /**
   * Test 1: Multiple networks with watchers
   */
  multipleNetworks: {
    config: {
      url: 'https://ergo-node.com',
      rwtRepoNFT: 'valid-rwt-token-id',
      rwtTokenMap: new Map<string, string>([
        ['valid-rwt-token-id', 'ergo'],
        ['cardano-rwt-token-id', 'cardano'],
      ]),
    } as WatcherCountConfig,
    mockBoxes: [
      createMockNodeBox('05e401', 'valid-rwt-token-id'),
      createMockNodeBox('0526', 'cardano-rwt-token-id'),
    ],
    expectedResults: {
      watcherCounts: [
        {
          network: 'ergo',
          count: 114,
        },
        {
          network: 'cardano',
          count: 19,
        },
      ],
      totalWatchers: '133',
    },
  },

  /**
   * Test 2: Boxes without valid network (should be skipped)
   */
  boxesWithoutValidNetwork: {
    config: {
      url: 'https://ergo-node.com',
      rwtRepoNFT: 'valid-rwt-token-id',
      rwtTokenMap: new Map<string, string>([['valid-rwt-token-id', 'ergo']]),
    } as WatcherCountConfig,
    mockBoxes: [
      createMockNodeBox('0526', 'valid-rwt-token-id'),
      createMockNodeBox('05e401', 'some-other-token-id'),
    ],
    expectedResults: {
      watcherCounts: [
        {
          network: 'ergo',
          count: 19,
        },
      ],
      totalWatchers: '19',
    },
  },

  /**
   * Test 3: No boxes found
   */
  noBoxesFound: {
    config: {
      url: 'https://ergo-node.com',
      rwtRepoNFT: 'valid-rwt-token-id',
      rwtTokenMap: new Map<string, string>([['valid-rwt-token-id', 'ergo']]),
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
      url: 'https://ergo-node.com',
      rwtRepoNFT: 'valid-rwt-token-id',
      rwtTokenMap: new Map<string, string>([
        ['valid-rwt-token-id', 'ergo'],
        ['valid-rwt-token-id-2', 'cardano'],
      ]),
    } as WatcherCountConfig,
    mockBoxes: [
      createMockNodeBox('05e401', 'valid-rwt-token-id'),
      createMockNodeBox('0526', 'valid-rwt-token-id-2'),
    ],
    expectedResults: {
      watcherCounts: [
        {
          network: 'ergo',
          count: 114,
        },
        {
          network: 'cardano',
          count: 19,
        },
      ],
      totalWatchers: '133',
    },
  },

  /**
   * Test 5: Error scenario with existing data
   */
  errorWithExistingData: {
    config: {
      url: 'https://ergo-node.com',
      rwtRepoNFT: 'valid-rwt-token-id',
      rwtTokenMap: new Map<string, string>([
        ['valid-rwt-token-id', 'ergo'],
        ['cardano-rwt-token-id', 'cardano'],
      ]),
    } as WatcherCountConfig,
    existingData: {
      watcherCounts: [
        { network: 'ergo', count: 100 },
        { network: 'cardano', count: 50 },
      ],
      totalMetric: {
        key: METRIC_KEYS.WATCHER_COUNT_TOTAL,
        value: '150',
        updatedAt: 12000,
      },
    },
    expectedResults: {
      watcherCounts: [
        { network: 'ergo', count: 100 },
        { network: 'cardano', count: 50 },
      ],
      totalWatchers: '150',
    },
  },
};
