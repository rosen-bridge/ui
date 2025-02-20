import { TxType, TxStatus, EventStatus } from '../src/constants';

export const eventId0 =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const eventId1 =
  '0000000000000000000000000000000000000000000000000000000000000001';
export const eventId2 =
  '0000000000000000000000000000000000000000000000000000000000000002';

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

type InsertStatusRequestType = {
  timestamp: number;
  guardPk: string;
  signature: string;
  eventId: string;
  status: EventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: TxStatus;
};

export const fakeInsertStatusRequests: InsertStatusRequestType[] = [
  {
    timestamp: 1000,
    guardPk: guardPk0,
    signature: '',
    eventId: eventId0,
    status: EventStatus.pendingPayment,
    txId: '',
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    timestamp: 1005,
    guardPk: guardPk0,
    signature: '',
    eventId: eventId0,
    status: EventStatus.completed,
    txId: '',
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    timestamp: 1010,
    guardPk: guardPk1,
    signature: '',
    eventId: eventId1,
    status: EventStatus.pendingPayment,
    txId: '',
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    timestamp: 1001,
    guardPk: guardPk0,
    signature: '',
    eventId: eventId0,
    status: EventStatus.timeout,
    txId: '',
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    timestamp: 1001,
    guardPk: guardPk0,
    signature: '',
    eventId: eventId2,
    status: EventStatus.timeout,
    txId: '',
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
  {
    timestamp: 1001,
    guardPk: guardPk1,
    signature: '',
    eventId: eventId0,
    status: EventStatus.timeout,
    txId: '',
    txType: TxType.payment,
    txStatus: TxStatus.signed,
  },
];

export const majorityInsertStatusRequests: InsertStatusRequestType[] = [
  {
    eventId: eventId0,
    timestamp: 900,
    status: EventStatus.pendingReward,
    txId: eventId0,
    txType: TxType.payment,
    txStatus: TxStatus.inSign,
    guardPk: guardPk3,
    signature: '',
  },
  {
    eventId: eventId0,
    timestamp: 1000,
    status: EventStatus.inReward,
    txId: eventId0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
    guardPk: guardPk0,
    signature: '',
  },
  {
    eventId: eventId0,
    timestamp: 1005,
    status: EventStatus.inReward,
    txId: eventId0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
    guardPk: guardPk1,
    signature: '',
  },
  {
    eventId: eventId0,
    timestamp: 1006,
    status: EventStatus.inReward,
    txId: eventId0,
    txType: TxType.payment,
    txStatus: TxStatus.signed,
    guardPk: guardPk2,
    signature: '',
  },
];

export const fakeInsertGuardStatusRequests: InsertStatusRequestType[] = [
  {
    eventId: eventId0,
    txType: TxType.payment,
    timestamp: 1000,
    status: EventStatus.pendingPayment,
    txStatus: TxStatus.signed,
    guardPk: guardPk0,
    signature: '',
  },
  {
    eventId: eventId1,
    txType: TxType.payment,
    timestamp: 1010,
    status: EventStatus.pendingPayment,
    txStatus: TxStatus.signed,
    guardPk: guardPk0,
    signature: '',
  },
  {
    eventId: eventId0,
    txType: TxType.payment,
    timestamp: 1005,
    status: EventStatus.completed,
    txStatus: TxStatus.signed,
    guardPk: guardPk0,
    signature: '',
  },
  {
    eventId: eventId0,
    txType: TxType.payment,
    timestamp: 1001,
    status: EventStatus.timeout,
    txStatus: TxStatus.signed,
    guardPk: guardPk1,
    signature: '',
  },
];
