import { DeepPartial } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS, EventCountStatus } from '../lib';

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
   * - New events from height 100
   * - Multiple groups with different statuses
   */
  getAggregatedEventsMultipleGroups: {
    lastProcessedHeight: 100,
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
        spendHeight: 90, // Below lastProcessedHeight - should be ignored
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

const createUserEvent = (
  baseData: typeof eventTriggerTestData.successfulErgoToCardano,
  eventId: string,
  boxId: string,
  extractor: string,
  fromAddress: string,
  toAddress: string,
  spendHeight: number,
) => ({
  ...baseData,
  eventId,
  boxId,
  extractor,
  fromAddress,
  toAddress,
  spendHeight,
  result: 'successful' as const,
});

export const userEventLastProcessedHeightScenarios = {
  empty: {
    expected: 0,
  },

  singleRecord: {
    userEventRepo: [userEventTestData.addr1ToAddr2],
    expected: 100,
  },

  multipleRecords: {
    userEventRepo: [
      userEventTestData.addr1ToAddr2,
      userEventTestData.addr1ToAddr3,
      userEventTestData.addr2ToAddr4,
    ],
    expected: 200,
  },

  mixedHeights: {
    userEventRepo: [
      { ...userEventTestData.addr1ToAddr2, lastProcessedHeight: 300 },
      { ...userEventTestData.addr1ToAddr3, lastProcessedHeight: 250 },
      { ...userEventTestData.addr2ToAddr4, lastProcessedHeight: 350 },
    ],
    expected: 350,
  },
};

export const userEventAggregatedScenarios = {
  emptyDatabase: {
    lastHeight: 0,
    expectedCount: 0,
  },

  singleSuccessfulEvent: {
    eventTriggerRepo: [eventTriggerTestData.successfulErgoToCardano],
    lastHeight: 0,
    expectedCount: 1,
    expectedGroups: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        userCount: 1,
        maxHeight: 110,
      },
    ],
  },

  multipleDifferentUserPairs: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      eventTriggerTestData.successfulCardanoToErgo,
      eventTriggerTestData.successfulEthereumToErgo,
    ],
    lastHeight: 0,
    expectedCount: 3,
    expectedGroups: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        userCount: 1,
        maxHeight: 110,
      },
      {
        fromAddress: 'addr2',
        toAddress: 'addr3',
        userCount: 1,
        maxHeight: 115,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        userCount: 1,
        maxHeight: 120,
      },
    ],
  },

  filterByLastHeight: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      eventTriggerTestData.successfulCardanoToErgo,
      eventTriggerTestData.successfulEthereumToErgo,
    ],
    lastHeight: 115,
    expectedCount: 1,
    expectedGroups: [
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        userCount: 1,
        maxHeight: 120,
      },
    ],
  },

  ignoreNonSuccessfulEvents: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      eventTriggerTestData.fraudErgoToCardano,
      eventTriggerTestData.pendingEvent,
      eventTriggerTestData.processingEvent,
    ],
    lastHeight: 0,
    expectedCount: 1,
    expectedGroups: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        userCount: 1,
        maxHeight: 110,
      },
    ],
  },

  aggregateSameUserPair: {
    eventTriggerRepo: [
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event1',
        'box1',
        'extractor1',
        'addr1',
        'addr2',
        110,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event2',
        'box2',
        'extractor2',
        'addr1',
        'addr2',
        115,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event3',
        'box3',
        'extractor3',
        'addr1',
        'addr2',
        120,
      ),
    ],
    lastHeight: 0,
    expectedCount: 1,
    expectedGroups: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        userCount: 3,
        maxHeight: 120,
      },
    ],
  },

  complexScenario: {
    eventTriggerRepo: [
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event1',
        'box1',
        'extractor1',
        'addr1',
        'addr2',
        110,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event2',
        'box2',
        'extractor2',
        'addr1',
        'addr2',
        115,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event3',
        'box3',
        'extractor3',
        'addr2',
        'addr3',
        120,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event4',
        'box4',
        'extractor4',
        'addr3',
        'addr4',
        125,
      ),
    ],
    lastHeight: 0,
    expectedCount: 3,
    expectedGroups: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        userCount: 2,
        maxHeight: 115,
      },
      {
        fromAddress: 'addr2',
        toAddress: 'addr3',
        userCount: 1,
        maxHeight: 120,
      },
      {
        fromAddress: 'addr3',
        toAddress: 'addr4',
        userCount: 1,
        maxHeight: 125,
      },
    ],
  },

  eventsBelowLastHeight: {
    eventTriggerRepo: [
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event1',
        'box1',
        'extractor1',
        'addr1',
        'addr2',
        90,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event2',
        'box2',
        'extractor2',
        'addr1',
        'addr2',
        95,
      ),
      createUserEvent(
        eventTriggerTestData.successfulErgoToCardano,
        'event3',
        'box3',
        'extractor3',
        'addr1',
        'addr2',
        105,
      ),
    ],
    lastHeight: 100,
    expectedCount: 1,
    expectedGroups: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        userCount: 1,
        maxHeight: 105,
      },
    ],
  },
};

export const userEventExistingScenarios = {
  noMatch: {
    userEventRepo: [userEventTestData.addr1ToAddr2],
    query: {
      fromAddress: 'addr3',
      toAddress: 'addr4',
    },
    expected: null,
  },

  exactMatch: {
    userEventRepo: [userEventTestData.addr1ToAddr2],
    query: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
    },
    expected: userEventTestData.addr1ToAddr2,
  },

  caseSensitiveAddresses: {
    userEventRepo: [userEventTestData.addr1ToAddr2],
    query: {
      fromAddress: 'ADDR1',
      toAddress: 'ADDR2',
    },
    expected: null,
  },

  multipleRecords: {
    userEventRepo: [
      userEventTestData.addr1ToAddr2,
      userEventTestData.addr1ToAddr3,
      userEventTestData.addr2ToAddr4,
    ],
    query: {
      fromAddress: 'addr1',
      toAddress: 'addr3',
    },
    expected: userEventTestData.addr1ToAddr3,
  },

  emptyDatabase: {
    query: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
    },
    expected: null,
  },
};

export const userEventUpsertScenarios = {
  insertNew: {
    initialData: [],
    upsertData: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 10,
      maxHeight: 500,
    },
    expectedCount: 1,
    expectedRecord: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 10,
      lastProcessedHeight: 500,
    },
  },

  updateExisting: {
    initialData: [userEventTestData.addr1ToAddr2],
    upsertData: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 15,
      maxHeight: 600,
    },
    expectedCount: 1,
    expectedRecord: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 15,
      lastProcessedHeight: 600,
    },
  },

  zeroCount: {
    initialData: [],
    upsertData: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 0,
      maxHeight: 500,
    },
    expectedCount: 1,
    expectedRecord: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 0,
      lastProcessedHeight: 500,
    },
  },

  multipleDifferentPairs: {
    initialData: [
      userEventTestData.addr1ToAddr2,
      userEventTestData.addr1ToAddr3,
    ],
    upsertData: {
      fromAddress: 'addr2',
      toAddress: 'addr4',
      count: 8,
      maxHeight: 400,
    },
    expectedCount: 3,
    expectedRecords: [
      userEventTestData.addr1ToAddr2,
      userEventTestData.addr1ToAddr3,
      {
        fromAddress: 'addr2',
        toAddress: 'addr4',
        count: 8,
        lastProcessedHeight: 400,
      },
    ],
  },

  updateMultipleTimes: {
    initialData: [],
    upsertOperations: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 5,
        maxHeight: 300,
      },
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 10,
        maxHeight: 500,
      },
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 15,
        maxHeight: 600,
      },
    ],
    expectedCount: 1,
    expectedRecord: {
      fromAddress: 'addr1',
      toAddress: 'addr2',
      count: 15,
      lastProcessedHeight: 600,
    },
  },

  duplicateAddressPairs: {
    initialData: [],
    upsertOperations: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 3,
        maxHeight: 200,
      },
      {
        fromAddress: 'addr2',
        toAddress: 'addr1',
        count: 2,
        maxHeight: 250,
      },
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 4,
        maxHeight: 300,
      },
    ],
    expectedCount: 2,
    expectedRecords: [
      {
        fromAddress: 'addr1',
        toAddress: 'addr2',
        count: 4,
        lastProcessedHeight: 300,
      },
      {
        fromAddress: 'addr2',
        toAddress: 'addr1',
        count: 2,
        lastProcessedHeight: 250,
      },
    ],
  },
};
