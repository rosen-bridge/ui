import { ERGO_CHAIN } from '@rosen-bridge/tokens';
import {
  TxType,
  TxStatus,
  EventStatus,
  AggregateEventStatus,
  AggregateTxStatus,
  AggregatedStatusChangedEntity,
  Threshold,
  AggregatedStatusEntity,
  GuardStatusChangedEntity,
} from '@rosen-ui/public-status';

export const id0 =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const id1 =
  '0000000000000000000000000000000000000000000000000000000000000001';

export const guardPk0 =
  '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1';
export const guardPk1 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6';

export const mockTxDTO = {
  txId: id1,
  chain: ERGO_CHAIN,
  txType: TxType.payment,
  txStatus: TxStatus.inSign,
};

export const mockNewTx = {
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

export const mockNewGuardStatus = {
  eventId: id0,
  guardPk: guardPk0,
  updatedAt: 20,
  status: EventStatus.timeout,
  tx: null,
  txStatus: null,
};
export const mockNewGuardStatusAggregateChange = {
  eventId: id0,
  guardPk: guardPk0,
  updatedAt: 20,
  status: EventStatus.completed,
  tx: null,
  txStatus: null,
};
export const mockExistingGuardStatus = {
  eventId: id0,
  guardPk: guardPk1,
  updatedAt: 10,
  status: EventStatus.inPayment,
  tx: null,
  txStatus: null,
};

export const mockNewGuardStatusChanged: GuardStatusChangedEntity = {
  id: 1,
  eventId: id0,
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
    guardPk: guardPk0,
    insertedAt: 20,
    status: EventStatus.completed,
    tx: null,
    txStatus: null,
  };
export const mockExistingGuardStatusChanged: GuardStatusChangedEntity = {
  id: 0,
  eventId: id0,
  guardPk: guardPk1,
  insertedAt: 10,
  status: EventStatus.inPayment,
  tx: null,
  txStatus: null,
};

export const mockNewAggregatedStatus: AggregatedStatusEntity = {
  eventId: id0,
  updatedAt: 20,
  status: AggregateEventStatus.finished,
  txStatus: null,
  tx: null,
};
export const mockNewAggregatedStatusChanged: AggregatedStatusChangedEntity = {
  id: 1,
  eventId: id0,
  insertedAt: 20,
  status: AggregateEventStatus.finished,
  txStatus: null,
  tx: null,
};

export const mockExistingAggregatedStatus: AggregatedStatusEntity = {
  eventId: id0,
  updatedAt: 10,
  status: AggregateEventStatus.waitingForConfirmation,
  txStatus: null,
  tx: null,
};
export const mockExistingAggregatedStatusChanged: AggregatedStatusChangedEntity =
  {
    id: 0,
    eventId: id0,
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
