import { ERGO_CHAIN } from '@rosen-bridge/tokens';
import {
  type AggregatedStatusChangedEntity,
  type AggregatedStatusEntity,
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  type GuardStatusChangedEntity,
  type GuardStatusEntity,
  type Threshold,
  type TxEntity,
  TxStatus,
  TxType,
} from '@rosen-ui/public-status';

import { guardPk0, guardPk1, id0, id1, triggerId0 } from './testData';

export const mockTxDTO = {
  txId: id1,
  chain: ERGO_CHAIN,
  txType: TxType.payment,
  txStatus: TxStatus.inSign,
};

export const mockNewTx: TxEntity = {
  txId: id1,
  chain: ERGO_CHAIN,
  eventId: id0,
  insertedAt: 20,
  txType: TxType.payment,
};

export const guardStatusDTOTx = {
  tx: {
    txId: mockTxDTO.txId,
    chain: mockTxDTO.chain,
  },
  txStatus: mockTxDTO.txStatus,
};

export const mockGuardStatusTx = {
  tx: mockNewTx,
  txStatus: mockTxDTO.txStatus,
};

export const mockNewGuardStatus: GuardStatusEntity = {
  eventId: id0,
  triggerTxId: triggerId0,
  guardPk: guardPk0,
  updatedAt: 20,
  status: EventStatus.timeout,
  tx: null,
  txStatus: null,
};
export const mockNewGuardStatusAggregateChange: GuardStatusEntity = {
  eventId: id0,
  triggerTxId: triggerId0,
  guardPk: guardPk0,
  updatedAt: 20,
  status: EventStatus.completed,
  tx: null,
  txStatus: null,
};
export const mockExistingGuardStatus: GuardStatusEntity = {
  eventId: id0,
  triggerTxId: triggerId0,
  guardPk: guardPk1,
  updatedAt: 10,
  status: EventStatus.inPayment,
  tx: null,
  txStatus: null,
};

export const mockNewGuardStatusChanged: GuardStatusChangedEntity = {
  id: 1,
  eventId: id0,
  triggerTxId: triggerId0,
  guardPk: guardPk0,
  insertedAt: 20,
  status: EventStatus.timeout,
  tx: null,
  txStatus: null,
};
export const mockNewGuardStatusChangedAggregateChange: GuardStatusChangedEntity =
  {
    id: 1,
    eventId: id0,
    triggerTxId: triggerId0,
    guardPk: guardPk0,
    insertedAt: 20,
    status: EventStatus.completed,
    tx: null,
    txStatus: null,
  };
export const mockExistingGuardStatusChanged: GuardStatusChangedEntity = {
  id: 0,
  eventId: id0,
  triggerTxId: triggerId0,
  guardPk: guardPk1,
  insertedAt: 10,
  status: EventStatus.inPayment,
  tx: null,
  txStatus: null,
};

export const mockNewAggregatedStatus: AggregatedStatusEntity = {
  eventId: id0,
  triggerTxId: triggerId0,
  updatedAt: 20,
  status: AggregateEventStatus.finished,
  txStatus: null,
  tx: null,
};
export const mockNewAggregatedStatusChanged: AggregatedStatusChangedEntity = {
  id: 1,
  eventId: id0,
  triggerTxId: triggerId0,
  insertedAt: 20,
  status: AggregateEventStatus.finished,
  txStatus: null,
  tx: null,
};

export const mockExistingAggregatedStatus: AggregatedStatusEntity = {
  eventId: id0,
  triggerTxId: triggerId0,
  updatedAt: 10,
  status: AggregateEventStatus.waitingForConfirmation,
  txStatus: null,
  tx: null,
};
export const mockExistingAggregatedStatusChanged: AggregatedStatusChangedEntity =
  {
    id: 0,
    eventId: id0,
    triggerTxId: triggerId0,
    insertedAt: 10,
    status: AggregateEventStatus.waitingForConfirmation,
    txStatus: null,
    tx: null,
  };

export const mockEventStatusThresholds: Threshold<AggregateEventStatus>[] = [
  { key: AggregateEventStatus.finished, count: 1 },
  { key: AggregateEventStatus.inReward, count: 3 },
  { key: AggregateEventStatus.pendingReward, count: 3 },
  { key: AggregateEventStatus.inPayment, count: 6 },
  { key: AggregateEventStatus.rejected, count: 5 },
  { key: AggregateEventStatus.timeout, count: 5 },
  { key: AggregateEventStatus.reachedLimit, count: 5 },
  { key: AggregateEventStatus.paymentWaiting, count: 5 },
  { key: AggregateEventStatus.pendingPayment, count: 3 },
];

export const mockTxStatusThresholds: Threshold<AggregateTxStatus>[] = [
  { key: AggregateTxStatus.completed, count: 1 },
  { key: AggregateTxStatus.invalid, count: 6 },
  { key: AggregateTxStatus.sent, count: 6 },
  { key: AggregateTxStatus.signed, count: 3 },
  { key: AggregateTxStatus.inSign, count: 6 },
];
