import {
  TxType,
  TxStatus,
  EventStatus,
  AggregateEventStatus,
  AggregateTxStatus,
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  GuardStatusChangedEntity,
  GuardStatusEntity,
  TxEntity,
} from '@rosen-ui/public-status';

export const id0 =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const id1 =
  '0000000000000000000000000000000000000000000000000000000000000001';
export const id2 =
  '0000000000000000000000000000000000000000000000000000000000000002';
export const id3 =
  '0000000000000000000000000000000000000000000000000000000000000003';

export const guardPk0 =
  '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1';
export const guardPk1 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6';
export const guardPk2 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c7';

export const mockTx0: TxEntity = {
  txId: id1,
  chain: 'c1',
  eventId: id0,
  insertedAt: 0,
  txType: TxType.payment,
};

export const mockAggregatedStatusChangedRecords: Omit<
  AggregatedStatusChangedEntity,
  'id'
>[] = [
  {
    eventId: id0,
    insertedAt: 1000,
    status: AggregateEventStatus.pendingPayment,
    txStatus: null,
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
    txStatus: null,
    tx: null,
  },
  {
    eventId: id2,
    insertedAt: 1001,
    status: AggregateEventStatus.timeout,
    txStatus: null,
    tx: null,
  },
];

export const mockAggregatedStatusRecords: AggregatedStatusEntity[] = [
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
    txStatus: null,
    tx: null,
  },
  {
    eventId: id2,
    updatedAt: 1001,
    status: AggregateEventStatus.timeout,
    txStatus: null,
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

export const mockGuardStatusRecords: GuardStatusEntity[] = [
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
    status: EventStatus.inPayment,
    tx: mockTx0,
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

export const mockPaginationTestData = {
  aggregatedStatusChanged: Array.from(Array(10).keys()).map((i) => ({
    id: i,
    eventId: id0,
    insertedAt: i,
    status: AggregateEventStatus.finished,
    txStatus: null,
    tx: null,
  })),
  guardStatusChanged: Array.from(Array(10).keys()).map((i) => ({
    id: i,
    eventId: id0,
    guardPk: `${i}`,
    insertedAt: i,
    status: EventStatus.completed,
    txStatus: null,
    tx: null,
  })),
  guardStatus: Array.from(Array(10).keys()).map((i) => ({
    eventId: id0,
    guardPk: `${i}`,
    updatedAt: i,
    status: EventStatus.completed,
    txStatus: null,
    tx: null,
  })),
};
