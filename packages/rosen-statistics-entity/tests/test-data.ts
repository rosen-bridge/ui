export const eventTriggerTestData = {
  successfulErgoToCardano: {
    eventId: 'event1',
    boxId: 'box1',
    block: 'block1',
    height: 100,
    extractor: 'ext1',
    fromChain: 'ergo',
    toChain: 'cardano',
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
    spendHeight: 110,
    spendTxId: 'spendTx1',
    result: 'successful',
    paymentTxId: 'paymentTx1',
    WIDsCount: 1,
    WIDsHash: 'hash1',
    serialized: '{}',
  },

  successfulCardanoToErgo: {
    eventId: 'event2',
    boxId: 'box2',
    block: 'block2',
    height: 101,
    extractor: 'ext2',
    fromChain: 'cardano',
    toChain: 'ergo',
    txId: 'tx2',
    fromAddress: 'addr2',
    toAddress: 'addr3',
    amount: '200',
    bridgeFee: '2',
    networkFee: '0.2',
    sourceChainTokenId: 'token3',
    sourceChainHeight: 101,
    targetChainTokenId: 'token4',
    sourceTxId: 'sourceTx2',
    sourceBlockId: 'sourceBlock2',
    spendBlock: 'block2',
    spendHeight: 115,
    spendTxId: 'spendTx2',
    result: 'successful',
    paymentTxId: 'paymentTx2',
    WIDsCount: 1,
    WIDsHash: 'hash2',
    serialized: '{}',
  },

  successfulEthereumToErgo: {
    eventId: 'event3',
    boxId: 'box3',
    block: 'block3',
    height: 102,
    extractor: 'ext3',
    fromChain: 'ethereum',
    toChain: 'ergo',
    txId: 'tx3',
    fromAddress: 'addr3',
    toAddress: 'addr4',
    amount: '300',
    bridgeFee: '3',
    networkFee: '0.3',
    sourceChainTokenId: 'token5',
    sourceChainHeight: 102,
    targetChainTokenId: 'token6',
    sourceTxId: 'sourceTx3',
    sourceBlockId: 'sourceBlock3',
    spendBlock: 'block3',
    spendHeight: 120,
    spendTxId: 'spendTx3',
    result: 'successful',
    paymentTxId: 'paymentTx3',
    WIDsCount: 1,
    WIDsHash: 'hash3',
    serialized: '{}',
  },

  fraudErgoToCardano: {
    eventId: 'event4',
    boxId: 'box4',
    block: 'block4',
    height: 103,
    extractor: 'ext4',
    fromChain: 'ergo',
    toChain: 'cardano',
    txId: 'tx4',
    fromAddress: 'addr4',
    toAddress: 'addr5',
    amount: '400',
    bridgeFee: '4',
    networkFee: '0.4',
    sourceChainTokenId: 'token7',
    sourceChainHeight: 103,
    targetChainTokenId: 'token8',
    sourceTxId: 'sourceTx4',
    sourceBlockId: 'sourceBlock4',
    spendBlock: 'block4',
    spendHeight: 125,
    spendTxId: 'spendTx4',
    result: 'fraud',
    paymentTxId: 'paymentTx4',
    WIDsCount: 1,
    WIDsHash: 'hash4',
    serialized: '{}',
  },

  fraudCardanoToEthereum: {
    eventId: 'event5',
    boxId: 'box5',
    block: 'block5',
    height: 104,
    extractor: 'ext5',
    fromChain: 'cardano',
    toChain: 'ethereum',
    txId: 'tx5',
    fromAddress: 'addr5',
    toAddress: 'addr6',
    amount: '500',
    bridgeFee: '5',
    networkFee: '0.5',
    sourceChainTokenId: 'token9',
    sourceChainHeight: 104,
    targetChainTokenId: 'token10',
    sourceTxId: 'sourceTx5',
    sourceBlockId: 'sourceBlock5',
    spendBlock: 'block5',
    spendHeight: 130,
    spendTxId: 'spendTx5',
    result: 'fraud',
    paymentTxId: 'paymentTx5',
    WIDsCount: 1,
    WIDsHash: 'hash5',
    serialized: '{}',
  },

  // Non-counted events (should be ignored)
  pendingEvent: {
    eventId: 'event6',
    boxId: 'box6',
    block: 'block6',
    height: 105,
    extractor: 'ext6',
    fromChain: 'ergo',
    toChain: 'cardano',
    txId: 'tx6',
    fromAddress: 'addr6',
    toAddress: 'addr7',
    amount: '600',
    bridgeFee: '6',
    networkFee: '0.6',
    sourceChainTokenId: 'token11',
    sourceChainHeight: 105,
    targetChainTokenId: 'token12',
    sourceTxId: 'sourceTx6',
    sourceBlockId: 'sourceBlock6',
    spendBlock: 'block6',
    spendHeight: 135,
    spendTxId: 'spendTx6',
    result: 'pending',
    paymentTxId: 'paymentTx6',
    WIDsCount: 1,
    WIDsHash: 'hash6',
    serialized: '{}',
  },

  processingEvent: {
    eventId: 'event7',
    boxId: 'box7',
    block: 'block7',
    height: 106,
    extractor: 'ext7',
    fromChain: 'cardano',
    toChain: 'ergo',
    txId: 'tx7',
    fromAddress: 'addr7',
    toAddress: 'addr8',
    amount: '700',
    bridgeFee: '7',
    networkFee: '0.7',
    sourceChainTokenId: 'token13',
    sourceChainHeight: 106,
    targetChainTokenId: 'token14',
    sourceTxId: 'sourceTx7',
    sourceBlockId: 'sourceBlock7',
    spendBlock: 'block7',
    spendHeight: 140,
    spendTxId: 'spendTx7',
    result: 'processing',
    paymentTxId: 'paymentTx7',
    WIDsCount: 1,
    WIDsHash: 'hash7',
    serialized: '{}',
  },
};

export const eventCountTestData = {
  successfulErgoToCardano: {
    status: 'successful',
    fromChain: 'ergo',
    toChain: 'cardano',
    eventCount: 5,
    lastProcessedHeight: 100,
  },

  fraudErgoToCardano: {
    status: 'fraud',
    fromChain: 'ergo',
    toChain: 'cardano',
    eventCount: 2,
    lastProcessedHeight: 100,
  },

  successfulCardanoToErgo: {
    status: 'successful',
    fromChain: 'cardano',
    toChain: 'ergo',
    eventCount: 3,
    lastProcessedHeight: 150,
  },

  successfulEthereumToErgo: {
    status: 'successful',
    fromChain: 'ethereum',
    toChain: 'ergo',
    eventCount: 1,
    lastProcessedHeight: 200,
  },

  fraudCardanoToEthereum: {
    status: 'fraud',
    fromChain: 'cardano',
    toChain: 'ethereum',
    eventCount: 4,
    lastProcessedHeight: 180,
  },
};

export const lastProcessedHeightScenarios = {
  empty: {
    eventCountRepo: [],
    expected: 0,
  },

  singleRecord: {
    eventCountRepo: [eventCountTestData.successfulErgoToCardano],
    expected: 100,
  },

  multipleRecords: {
    eventCountRepo: [
      eventCountTestData.successfulErgoToCardano,
      eventCountTestData.fraudErgoToCardano,
      eventCountTestData.successfulCardanoToErgo,
    ],
    expected: 150,
  },

  mixedHeights: {
    eventCountRepo: [
      {
        ...eventCountTestData.successfulErgoToCardano,
        lastProcessedHeight: 300,
      },
      { ...eventCountTestData.fraudErgoToCardano, lastProcessedHeight: 250 },
      {
        ...eventCountTestData.successfulCardanoToErgo,
        lastProcessedHeight: 350,
      },
    ],
    expected: 350,
  },
};

export const aggregatedEventsScenarios = {
  emptyDatabase: {
    eventTriggerRepo: [],
    lastHeight: 0,
    expectedCount: 0,
    expectedGroups: [],
  },

  singleSuccessfulEvent: {
    eventTriggerRepo: [eventTriggerTestData.successfulErgoToCardano],
    lastHeight: 0,
    expectedCount: 1,
    expectedGroups: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 110,
      },
    ],
  },

  multipleDifferentGroups: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      eventTriggerTestData.successfulCardanoToErgo,
      eventTriggerTestData.fraudErgoToCardano,
    ],
    lastHeight: 0,
    expectedCount: 3,
    expectedGroups: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 110,
      },
      {
        status: 'successful',
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 1,
        maxHeight: 115,
      },
      {
        status: 'fraud',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 125,
      },
    ],
  },

  filterByLastHeight: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      eventTriggerTestData.successfulCardanoToErgo,
      eventTriggerTestData.fraudErgoToCardano,
    ],
    lastHeight: 115,
    expectedCount: 1,
    expectedGroups: [
      {
        status: 'fraud',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 125,
      },
    ],
  },

  ignoreNonSuccessfulFraud: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      eventTriggerTestData.pendingEvent,
      eventTriggerTestData.processingEvent,
    ],
    lastHeight: 0,
    expectedCount: 1,
    expectedGroups: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 1,
        maxHeight: 110,
      },
    ],
  },

  aggregateSameGroup: {
    eventTriggerRepo: [
      { ...eventTriggerTestData.successfulErgoToCardano, spendHeight: 110 },
      {
        ...eventTriggerTestData.successfulErgoToCardano,
        eventId: 'event1b',
        boxId: 'box1b',
        spendHeight: 115,
      },
      {
        ...eventTriggerTestData.successfulErgoToCardano,
        eventId: 'event1c',
        boxId: 'box1c',
        spendHeight: 120,
      },
    ],
    lastHeight: 0,
    expectedCount: 1,
    expectedGroups: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 3,
        maxHeight: 120,
      },
    ],
  },

  complexScenario: {
    eventTriggerRepo: [
      eventTriggerTestData.successfulErgoToCardano,
      {
        ...eventTriggerTestData.successfulErgoToCardano,
        eventId: 'event1b',
        boxId: 'box1b',
        spendHeight: 115,
      },
      eventTriggerTestData.fraudCardanoToEthereum,
      eventTriggerTestData.successfulEthereumToErgo,
    ],
    lastHeight: 0,
    expectedCount: 3,
    expectedGroups: [
      {
        status: 'successful',
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 2,
        maxHeight: 115,
      },
      {
        status: 'fraud',
        fromChain: 'cardano',
        toChain: 'ethereum',
        eventCount: 1,
        maxHeight: 130,
      },
      {
        status: 'successful',
        fromChain: 'ethereum',
        toChain: 'ergo',
        eventCount: 1,
        maxHeight: 120,
      },
    ],
  },
};

export const existingEventCountScenarios = {
  noMatch: {
    eventCountRepo: [eventCountTestData.successfulErgoToCardano],
    query: {
      status: 'fraud',
      fromChain: 'ergo',
      toChain: 'cardano',
    },
    expected: null,
  },

  exactMatch: {
    eventCountRepo: [eventCountTestData.successfulErgoToCardano],
    query: {
      status: 'successful',
      fromChain: 'ergo',
      toChain: 'cardano',
    },
    expected: eventCountTestData.successfulErgoToCardano,
  },

  caseSensitive: {
    eventCountRepo: [eventCountTestData.successfulErgoToCardano],
    query: {
      status: 'SUCCESSFUL',
      fromChain: 'ergo',
      toChain: 'cardano',
    },
    expected: null,
  },

  multipleRecords: {
    eventCountRepo: [
      eventCountTestData.successfulErgoToCardano,
      eventCountTestData.fraudErgoToCardano,
      eventCountTestData.successfulCardanoToErgo,
    ],
    query: {
      status: 'fraud',
      fromChain: 'ergo',
      toChain: 'cardano',
    },
    expected: eventCountTestData.fraudErgoToCardano,
  },

  emptyDatabase: {
    eventCountRepo: [],
    query: {
      status: 'successful',
      fromChain: 'ergo',
      toChain: 'cardano',
    },
    expected: null,
  },
};

export const upsertEventCountScenarios = {
  insertNew: {
    initialData: [],
    upsertData: {
      status: 'successful' as const,
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 10,
      maxHeight: 500,
    },
    expectedCount: 1,
    expectedRecord: {
      status: 'successful',
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 10,
      lastProcessedHeight: 500,
    },
  },

  updateExisting: {
    initialData: [eventCountTestData.successfulErgoToCardano],
    upsertData: {
      status: 'successful' as const,
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 15,
      maxHeight: 600,
    },
    expectedCount: 1,
    expectedRecord: {
      status: 'successful',
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 15,
      lastProcessedHeight: 600,
    },
  },

  zeroEventCount: {
    initialData: [],
    upsertData: {
      status: 'successful' as const,
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 0,
      maxHeight: 500,
    },
    expectedCount: 1,
    expectedRecord: {
      status: 'successful',
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 0,
      lastProcessedHeight: 500,
    },
  },

  multipleDifferentKeys: {
    initialData: [
      eventCountTestData.successfulErgoToCardano,
      eventCountTestData.fraudErgoToCardano,
    ],
    upsertData: {
      status: 'successful' as const,
      fromChain: 'cardano',
      toChain: 'ergo',
      eventCount: 8,
      maxHeight: 400,
    },
    expectedCount: 3,
    expectedRecords: [
      eventCountTestData.successfulErgoToCardano,
      eventCountTestData.fraudErgoToCardano,
      {
        status: 'successful',
        fromChain: 'cardano',
        toChain: 'ergo',
        eventCount: 8,
        lastProcessedHeight: 400,
      },
    ],
  },

  updateMultipleTimes: {
    initialData: [],
    upsertOperations: [
      {
        status: 'successful' as const,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 5,
        maxHeight: 300,
      },
      {
        status: 'successful' as const,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 10,
        maxHeight: 500,
      },
      {
        status: 'successful' as const,
        fromChain: 'ergo',
        toChain: 'cardano',
        eventCount: 15,
        maxHeight: 600,
      },
    ],
    expectedCount: 1,
    expectedRecord: {
      status: 'successful',
      fromChain: 'ergo',
      toChain: 'cardano',
      eventCount: 15,
      lastProcessedHeight: 600,
    },
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
