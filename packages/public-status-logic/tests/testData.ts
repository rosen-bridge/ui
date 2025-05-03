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
import { AggregatedStatus, Threshold } from '../src/types';

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
export const guardPk3 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c8';

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

export const txEntityRecord: TxEntity = {
  txId: '0000000000000000000000000000000000000000000000000000000000000001',
  chain: 'c1',
  eventId: '0000000000000000000000000000000000000000000000000000000000000001',
  insertedAt: 0,
  txType: TxType.reward,
  aggregatedStatusChangedRecords: undefined,
  aggregatedStatusRecords: undefined,
  guardStatusChangedRecords: undefined,
  guardStatusRecords: undefined,
};

export const mockTxDTO = {
  txId: 'tx456',
  chain: 'testChain',
  txType: 'reward' as TxType,
  txStatus: 'newStatus' as TxStatus,
};

const nullGuardStatusTxDTO = {
  tx: null as TxEntity | null,
  txStatus: null as TxStatus | null,
};
const guardStatusTxDTO = {
  tx: {
    txId: mockTxDTO.txId,
    chain: mockTxDTO.chain,
  } as TxEntity | null,
  txStatus: mockTxDTO.txStatus as TxStatus | null,
};

export const mockGuardStatusTx = {
  txId: mockTxDTO.txId,
  chain: mockTxDTO.chain,
  txStatus: mockTxDTO.txStatus as TxStatus | null,
};

export const mockExistingGuardStatus = {
  eventId: 'eventId0',
  guardPk: 'guardPk1',
  updatedAt: 10,
  status: 'oldStatus' as EventStatus,
  ...nullGuardStatusTxDTO,
};
export const mockNewGuardStatus = {
  eventId: 'eventId0',
  guardPk: 'guardPk0',
  updatedAt: 20,
  status: 'newStatus' as EventStatus,
  ...nullGuardStatusTxDTO,
};
export const mockNewGuardStatusWithTx = {
  eventId: 'eventId0',
  guardPk: 'guardPk0',
  updatedAt: 22,
  status: 'newStatus' as EventStatus,
  ...guardStatusTxDTO,
};

// mocks for aggregated status objects returned from Utils.calcAggregatedStatus
export const mockAggregatedStatus: AggregatedStatus = {
  status: AggregateEventStatus.finished,
  txStatus: AggregateTxStatus.waitingForConfirmation,
  tx: { txId: mockTxDTO.txId, chain: mockTxDTO.chain },
};

export const mockAggregatedStatusOld: AggregatedStatus = {
  status: 'aggStatusOld' as AggregateEventStatus,
  txStatus: 'aggTxStatusOld' as AggregateTxStatus,
  tx: undefined,
};

export const mockEventStatusThresholds: Threshold<AggregateEventStatus> = [
  { status: AggregateEventStatus.finished, count: 6 },
  { status: AggregateEventStatus.inReward, count: 3 },
  { status: AggregateEventStatus.pendingReward, count: 3 },
  { status: AggregateEventStatus.inPayment, count: 6 },
  { status: AggregateEventStatus.rejected, count: 5 },
  { status: AggregateEventStatus.timeout, count: 5 },
  { status: AggregateEventStatus.reachedLimit, count: 5 },
  { status: AggregateEventStatus.paymentWaiting, count: 5 },
  { status: AggregateEventStatus.pendingPayment, count: 3 },
];

export const mockTxStatusThresholds: Threshold<AggregateTxStatus> = [
  { status: AggregateTxStatus.completed, count: 6 },
  { status: AggregateTxStatus.invalid, count: 6 },
  { status: AggregateTxStatus.sent, count: 6 },
  { status: AggregateTxStatus.signed, count: 3 },
  { status: AggregateTxStatus.inSign, count: 6 },
];
