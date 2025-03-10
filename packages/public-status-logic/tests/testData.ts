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
  // signature: string;
  status: EventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: TxStatus;
};

export const fakeInsertStatusRequests: InsertStatusRequest[] = [
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1000,
    status: EventStatus.pendingPayment,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1005,
    status: EventStatus.completed,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id1,
    guardPk: guardPk1,
    timestampSeconds: 1010,
    status: EventStatus.pendingPayment,
    txId: id1,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1001,
    status: EventStatus.timeout,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id2,
    guardPk: guardPk0,
    timestampSeconds: 1001,
    status: EventStatus.timeout,
    txId: id2,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    timestampSeconds: 1001,
    status: EventStatus.timeout,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
];

export const aggregateTestInsertStatusRequests: InsertStatusRequest[] = [
  {
    eventId: id0,
    guardPk: guardPk3,
    timestampSeconds: 900,
    status: EventStatus.pendingReward,
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    timestampSeconds: 1000,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    timestampSeconds: 1005,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk2,
    timestampSeconds: 1006,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    timestampSeconds: 1010,
    status: EventStatus.pendingReward,
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
  },
  {
    eventId: id0,
    guardPk: guardPk3,
    timestampSeconds: 1012,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
  },
];

export const fakeAggregatedStatusChangedRecords: Omit<
  AggregatedStatusChangedEntity,
  'id'
>[] = [
  {
    eventId: id0,
    insertedAt: 1000,
    status: AggregateEventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    eventId: id0,
    insertedAt: 1005,
    status: AggregateEventStatus.finished,
    tx: { txId: id1 } as unknown as TxEntity,
    txStatus: AggregateTxStatus.signed,
  },
  {
    eventId: id1,
    insertedAt: 1010,
    status: AggregateEventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    eventId: id2,
    insertedAt: 1001,
    status: AggregateEventStatus.timeout,
    tx: null,
    txStatus: null,
  },
];

export const fakeAggregatedStatusRecords: Omit<AggregatedStatusEntity, 'id'>[] =
  [
    {
      eventId: id0,
      updatedAt: 1005,
      status: AggregateEventStatus.finished,
      tx: { txId: id1 } as unknown as TxEntity,
      txStatus: AggregateTxStatus.signed,
    },
    {
      eventId: id1,
      updatedAt: 1010,
      status: AggregateEventStatus.pendingPayment,
      tx: null,
      txStatus: null,
    },
    {
      eventId: id2,
      updatedAt: 1001,
      status: AggregateEventStatus.timeout,
      tx: null,
      txStatus: null,
    },
  ];

export const fakeGuardStatusChangedRecords: Omit<
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
    tx: { txId: id1 } as unknown as TxEntity,
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

export const fakeGuardStatusRecords: Omit<GuardStatusEntity, 'id'>[] = [
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
    tx: { txId: id1 } as unknown as TxEntity,
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

export const fakeTxs: Omit<
  TxEntity,
  | 'aggregatedStatusRecords'
  | 'guardStatusRecords'
  | 'aggregatedStatusChangedRecords'
  | 'guardStatusChangedRecords'
>[] = [
  {
    txId: id0,
    eventId: id0,
    insertedAt: 1000,
    txType: TxType.payment,
  },
  {
    txId: id1,
    eventId: id0,
    insertedAt: 1100,
    txType: TxType.reward,
  },
  {
    txId: id2,
    eventId: id2,
    insertedAt: 1005,
    txType: TxType.payment,
  },
];
