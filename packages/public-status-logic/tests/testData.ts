import {
  TxType,
  TxStatus,
  EventStatus,
  AggregateEventStatus,
  AggregateTxStatus,
} from '../src/constants';
import { AggregatedStatusChangedEntity } from '../src/db/entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from '../src/db/entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from '../src/db/entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from '../src/db/entities/GuardStatusEntity';
import { TxEntity } from '../src/db/entities/TxEntity';

export const id0 =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const id1 =
  '0000000000000000000000000000000000000000000000000000000000000001';
export const id2 =
  '0000000000000000000000000000000000000000000000000000000000000002';
export const id3 =
  '0000000000000000000000000000000000000000000000000000000000000003';

export const guardSecret0 =
  'a7bcd47224d594830d53558848d88f7eb89d9a3b944a59cda11f478e803039eb';
export const guardPk0 =
  '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1';
export const guardSecret1 =
  '5fe85ea89577306517175ee47b026decc60830dbc05e4e9b2cafad881fcd49f6';
export const guardPk1 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6';
export const guardPk2 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c7';
export const guardPk3 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c8';

type InsertStatusRequest = {
  eventId: string;
  guardPk: string;
  timestampSeconds: number;
  status: EventStatus;
  tx?: {
    txId: string;
    chain: string;
    txType: TxType;
    txStatus: TxStatus;
  };
};

export const mockTx0 = {
  txId: id0,
  chain: 'c1',
  txType: TxType.payment,
  txStatus: TxStatus.signed,
};

export const mockTx01 = {
  txId: id0,
  chain: 'c1',
  txType: TxType.reward,
  txStatus: TxStatus.signed,
};

export const mockTx1 = {
  txId: id1,
  chain: 'c1',
  txType: TxType.payment,
  txStatus: TxStatus.signed,
};

export const mockTx2 = {
  txId: id2,
  chain: 'c1',
  txType: TxType.payment,
  txStatus: TxStatus.signed,
};

export const mockInsertStatusRequests: InsertStatusRequest[] = [
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1000,
    status: EventStatus.pendingPayment,
    tx: mockTx0,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1005,
    status: EventStatus.completed,
    tx: mockTx0,
  },
  {
    eventId: id1,
    guardPk: guardPk1,
    timestampSeconds: 1010,
    status: EventStatus.pendingPayment,
    tx: mockTx1,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1001,
    status: EventStatus.timeout,
    tx: mockTx0,
  },
  {
    eventId: id2,
    guardPk: guardPk0,
    timestampSeconds: 1001,
    status: EventStatus.timeout,
    tx: mockTx2,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    timestampSeconds: 1001,
    status: EventStatus.timeout,
    tx: mockTx0,
  },
];

export const mockInsertStatusRequestsForAggregateTest: InsertStatusRequest[] = [
  {
    eventId: id0,
    guardPk: guardPk3,
    timestampSeconds: 900,
    status: EventStatus.pendingReward,
    tx: undefined,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1000,
    status: EventStatus.inReward,
    tx: mockTx01,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    timestampSeconds: 1005,
    status: EventStatus.inReward,
    tx: mockTx01,
  },
  {
    eventId: id0,
    guardPk: guardPk2,
    timestampSeconds: 1006,
    status: EventStatus.inReward,
    tx: mockTx01,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    timestampSeconds: 1010,
    status: EventStatus.pendingReward,
    tx: undefined,
  },
  {
    eventId: id0,
    guardPk: guardPk3,
    timestampSeconds: 1012,
    status: EventStatus.inReward,
    tx: mockTx01,
  },
];

export const mockAggregatedStatusChangedRecords: Omit<
  AggregatedStatusChangedEntity,
  'id'
>[] = [
  {
    eventId: id0,
    insertedAt: 1000,
    status: AggregateEventStatus.pendingPayment,
    txStatus: AggregateTxStatus.waitingForConfirmation,
    tx: null,
  },
  {
    eventId: id0,
    insertedAt: 1005,
    status: AggregateEventStatus.finished,
    txStatus: AggregateTxStatus.signed,
    tx: { txId: id1, chain: 'c1' } as unknown as TxEntity,
  },
  {
    eventId: id1,
    insertedAt: 1010,
    status: AggregateEventStatus.pendingPayment,
    txStatus: AggregateTxStatus.waitingForConfirmation,
    tx: null,
  },
  {
    eventId: id2,
    insertedAt: 1001,
    status: AggregateEventStatus.timeout,
    txStatus: AggregateTxStatus.waitingForConfirmation,
    tx: null,
  },
];

export const mockAggregatedStatusRecords: Omit<AggregatedStatusEntity, 'id'>[] =
  [
    {
      eventId: id0,
      updatedAt: 1005,
      status: AggregateEventStatus.finished,
      txStatus: AggregateTxStatus.signed,
      tx: { txId: id1, chain: 'c1' } as unknown as TxEntity,
    },
    {
      eventId: id1,
      updatedAt: 1010,
      status: AggregateEventStatus.pendingPayment,
      txStatus: AggregateTxStatus.waitingForConfirmation,
      tx: null,
    },
    {
      eventId: id2,
      updatedAt: 1001,
      status: AggregateEventStatus.timeout,
      txStatus: AggregateTxStatus.waitingForConfirmation,
      tx: null,
    },
  ];

export const mockGuardStatusChangedRecords: Omit<
  GuardStatusChangedEntity,
  'id'
>[] = [
  {
    eventId: id0,
    guardPk: guardPk0,
    insertedAt: 1000,
    status: EventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    eventId: id1,
    guardPk: guardPk0,
    insertedAt: 1010,
    status: EventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    insertedAt: 1005,
    status: EventStatus.completed,
    tx: { txId: id1, chain: 'c1' } as unknown as TxEntity,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    insertedAt: 1001,
    status: EventStatus.timeout,
    tx: null,
    txStatus: null,
  },
];

export const mockGuardStatusRecords: Omit<GuardStatusEntity, 'id'>[] = [
  {
    eventId: id1,
    guardPk: guardPk0,
    updatedAt: 1010,
    status: EventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    updatedAt: 1005,
    status: EventStatus.completed,
    tx: { txId: id1, chain: 'c1' } as unknown as TxEntity,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    updatedAt: 1001,
    status: EventStatus.timeout,
    tx: null,
    txStatus: null,
  },
];

export const mockTxs: Omit<
  TxEntity,
  | 'aggregatedStatusRecords'
  | 'guardStatusRecords'
  | 'aggregatedStatusChangedRecords'
  | 'guardStatusChangedRecords'
>[] = [
  {
    txId: id0,
    chain: 'c1',
    eventId: id0,
    insertedAt: 1000,
    txType: TxType.payment,
  },
  {
    txId: id1,
    chain: 'c1',
    eventId: id0,
    insertedAt: 1100,
    txType: TxType.reward,
  },
  {
    txId: id2,
    chain: 'c1',
    eventId: id2,
    insertedAt: 1005,
    txType: TxType.payment,
  },
];

const insertStatusTestTx = {
  txId: id0,
  chain: 'c1',
  txStatus: TxStatus.signed,
};

export const insertStatusTestData = {
  returningValues: {
    getGuardsStatuses: [
      [],
      [
        {
          id: 1,
          eventId: id0,
          guardPk: guardPk3,
          updatedAt: 900,
          status: EventStatus.pendingReward,
          tx: null,
          txStatus: null,
        },
      ],
      [
        {
          id: 1,
          eventId: id0,
          guardPk: guardPk3,
          updatedAt: 900,
          status: EventStatus.pendingReward,
          tx: null,
          txStatus: null,
        },
        {
          id: 2,
          eventId: id0,
          guardPk: guardPk0,
          updatedAt: 1000,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
      ],
      [
        {
          id: 1,
          eventId: id0,
          guardPk: guardPk3,
          updatedAt: 900,
          status: EventStatus.pendingReward,
          tx: null,
          txStatus: null,
        },
        {
          id: 2,
          eventId: id0,
          guardPk: guardPk0,
          updatedAt: 1000,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
        {
          id: 3,
          eventId: id0,
          guardPk: guardPk1,
          updatedAt: 1005,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
      ],
      [
        {
          id: 1,
          eventId: id0,
          guardPk: guardPk3,
          updatedAt: 900,
          status: EventStatus.pendingReward,
          tx: null,
          txStatus: null,
        },
        {
          id: 2,
          eventId: id0,
          guardPk: guardPk0,
          updatedAt: 1000,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
        {
          id: 3,
          eventId: id0,
          guardPk: guardPk1,
          updatedAt: 1005,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
        {
          id: 4,
          eventId: id0,
          guardPk: guardPk2,
          updatedAt: 1006,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
      ],
      [
        {
          id: 1,
          eventId: id0,
          guardPk: guardPk3,
          updatedAt: 900,
          status: EventStatus.pendingReward,
          tx: null,
          txStatus: null,
        },
        {
          id: 2,
          eventId: id0,
          guardPk: guardPk0,
          updatedAt: 1000,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
        {
          id: 4,
          eventId: id0,
          guardPk: guardPk2,
          updatedAt: 1006,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txType: TxType.reward,
          } as unknown as TxEntity,
          txStatus: TxStatus.signed,
        },
        {
          id: 5,
          eventId: id0,
          guardPk: guardPk1,
          updatedAt: 1010,
          status: EventStatus.pendingReward,
          tx: null,
          txStatus: null,
        },
      ],
    ],
    calcAggregatedStatus: [
      {
        status: AggregateEventStatus.waitingForConfirmation,
        txStatus: AggregateTxStatus.waitingForConfirmation,
        tx: undefined,
      },
      {
        status: AggregateEventStatus.waitingForConfirmation,
        txStatus: AggregateTxStatus.waitingForConfirmation,
        tx: undefined,
      },
      {
        status: AggregateEventStatus.waitingForConfirmation,
        txStatus: AggregateTxStatus.waitingForConfirmation,
        tx: undefined,
      },
      {
        status: AggregateEventStatus.inReward,
        txStatus: AggregateTxStatus.signed,
        tx: insertStatusTestTx,
      },
      {
        status: AggregateEventStatus.waitingForConfirmation,
        txStatus: AggregateTxStatus.waitingForConfirmation,
        tx: undefined,
      },
      {
        status: AggregateEventStatus.inReward,
        txStatus: AggregateTxStatus.signed,
        tx: insertStatusTestTx,
      },
    ],
  },
  expectingSequence: {
    insertTx: [
      undefined,
      [id0, 'c1', id0, 1000, TxType.reward],
      undefined,
      undefined,
      undefined,
      undefined,
    ],
    getGuardsStatuses: [
      [id0, []],
      [id0, []],
      [id0, []],
      [id0, []],
      [id0, []],
      [id0, []],
    ],
    insertAggregatedStatusChanged: [
      [
        id0,
        900,
        AggregateEventStatus.waitingForConfirmation,
        AggregateTxStatus.waitingForConfirmation,
        undefined,
      ],
      undefined,
      undefined,
      [
        id0,
        1006,
        AggregateEventStatus.inReward,
        AggregateTxStatus.signed,
        { txId: id0, chain: 'c1' },
      ],
      [
        id0,
        1010,
        AggregateEventStatus.waitingForConfirmation,
        AggregateTxStatus.waitingForConfirmation,
        undefined,
      ],
      [
        id0,
        1012,
        AggregateEventStatus.inReward,
        AggregateTxStatus.signed,
        { txId: id0, chain: 'c1' },
      ],
    ],
    insertGuardStatusChanged: [
      [id0, guardPk3, 900, EventStatus.pendingReward, undefined],
      [id0, guardPk0, 1000, EventStatus.inReward, insertStatusTestTx],
      [id0, guardPk1, 1005, EventStatus.inReward, insertStatusTestTx],
      [id0, guardPk2, 1006, EventStatus.inReward, insertStatusTestTx],
      [id0, guardPk1, 1010, EventStatus.pendingReward, undefined],
      [id0, guardPk3, 1012, EventStatus.inReward, insertStatusTestTx],
    ],
    calcAggregatedStatus: [
      undefined,
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk2,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk2,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk2,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk3,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk2,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
        ],
      ],
      [
        [
          {
            guardPk: guardPk0,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk2,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
          {
            guardPk: guardPk1,
            status: EventStatus.pendingReward,
            tx: undefined,
          },
          {
            guardPk: guardPk3,
            status: EventStatus.inReward,
            tx: insertStatusTestTx,
          },
        ],
      ],
    ],
  },
};
