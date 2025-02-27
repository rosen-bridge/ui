import {
  TxType,
  TxStatus,
  EventStatus,
  AggregateEventStatus,
} from '../src/constants';
import { GuardStatusChangedEntity } from '../src/db/entities/GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from '../src/db/entities/OverallStatusChangedEntity';
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
  insertedAt: number;
  guardPk: string;
  // signature: string;
  eventId: string;
  status: EventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: TxStatus;
};

// used in EventStatusActions
export const fakeInsertStatusRequests: InsertStatusRequest[] = [
  {
    insertedAt: 1000,
    guardPk: guardPk0,
    eventId: id0,
    status: EventStatus.pendingPayment,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    insertedAt: 1005,
    guardPk: guardPk0,
    eventId: id0,
    status: EventStatus.completed,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    insertedAt: 1010,
    guardPk: guardPk1,
    eventId: id1,
    status: EventStatus.pendingPayment,
    txId: id1,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    insertedAt: 1001,
    guardPk: guardPk0,
    eventId: id0,
    status: EventStatus.timeout,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    insertedAt: 1001,
    guardPk: guardPk0,
    eventId: id2,
    status: EventStatus.timeout,
    txId: id2,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    insertedAt: 1001,
    guardPk: guardPk1,
    eventId: id0,
    status: EventStatus.timeout,
    txId: id0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
];

// used in EventStatusActions
export const aggregateTestInsertStatusRequests: InsertStatusRequest[] = [
  {
    eventId: id0,
    insertedAt: 900,
    status: EventStatus.pendingReward,
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
    guardPk: guardPk3,
  },
  {
    eventId: id0,
    insertedAt: 1000,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
    guardPk: guardPk0,
  },
  {
    eventId: id0,
    insertedAt: 1005,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
    guardPk: guardPk1,
  },
  {
    eventId: id0,
    insertedAt: 1006,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
    guardPk: guardPk2,
  },
  {
    eventId: id0,
    insertedAt: 1010,
    status: EventStatus.pendingReward,
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
    guardPk: guardPk1,
  },
  {
    eventId: id0,
    insertedAt: 1012,
    status: EventStatus.inReward,
    txId: id0,
    txType: TxType.reward,
    txStatus: TxStatus.signed,
    guardPk: guardPk3,
  },
];

// used in EventStatusActor
export const fakeOverallStatuses: Omit<OverallStatusChangedEntity, 'id'>[] = [
  {
    insertedAt: 1000,
    eventId: id0,
    status: AggregateEventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    insertedAt: 1005,
    eventId: id0,
    status: AggregateEventStatus.finished,
    tx: null,
    txStatus: null,
  },
  {
    insertedAt: 1010,
    eventId: id1,
    status: AggregateEventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    insertedAt: 1001,
    eventId: id0,
    status: AggregateEventStatus.timeout,
    tx: null,
    txStatus: null,
  },
  {
    insertedAt: 1001,
    eventId: id2,
    status: AggregateEventStatus.timeout,
    tx: null,
    txStatus: null,
  },
];

// used in EventStatusActor
export const fakeGuardStatuses: Omit<GuardStatusChangedEntity, 'id'>[] = [
  {
    eventId: id0,
    insertedAt: 1000,
    status: EventStatus.pendingPayment,
    tx: null,
    txStatus: null,
    guardPk: guardPk0,
  },
  {
    eventId: id1,
    insertedAt: 1010,
    status: EventStatus.pendingPayment,
    tx: null,
    txStatus: null,
    guardPk: guardPk0,
  },
  {
    eventId: id0,
    insertedAt: 1005,
    status: EventStatus.completed,
    tx: null,
    txStatus: null,
    guardPk: guardPk0,
  },
  {
    eventId: id0,
    insertedAt: 1001,
    status: EventStatus.timeout,
    tx: null,
    txStatus: null,
    guardPk: guardPk1,
  },
];

// used in EventStatusActor
export const fakeTx: Omit<
  TxEntity,
  'overallStatusChangedRecords' | 'guardStatusChangedRecords'
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
