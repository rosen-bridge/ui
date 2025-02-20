import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
} from './constants';
import { GuardStatusChangedEntity } from './db/entities/GuardStatusChangedEntity';
import { StatusChangedEntity } from './db/entities/StatusChangedEntity';
import { eventStatusThresholds, txStatusThresholds } from './thresholds';

export type MajorityStatus = {
  status: AggregateEventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: AggregateTxStatus;
};

export function majorityMatch(s1: MajorityStatus, s2: MajorityStatus): boolean {
  return (
    s1.status === s2.status &&
    s1.txId === s2.txId &&
    s1.txType === s2.txType &&
    s1.txStatus === s2.txStatus
  );
}

export function getMajorityFromStatuses(
  statuses: GuardStatusChangedEntity[],
): MajorityStatus {
  const majority: MajorityStatus = {
    status: AggregateEventStatus.waitingForConfirmation,
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
  };

  if (statuses.length > 0) {
    const statusesCount: Record<AggregateEventStatus, number> = {
      [AggregateEventStatus.pendingPayment]: 0,
      [AggregateEventStatus.pendingReward]: 0,
      [AggregateEventStatus.inPayment]: 0,
      [AggregateEventStatus.inReward]: 0,
      [AggregateEventStatus.finished]: 0,
      [AggregateEventStatus.rejected]: 0,
      [AggregateEventStatus.timeout]: 0,
      [AggregateEventStatus.reachedLimit]: 0,
      [AggregateEventStatus.paymentWaiting]: 0,
      [AggregateEventStatus.rewardWaiting]: 0,
      [AggregateEventStatus.waitingForConfirmation]: 0,
    };

    const txIdCount: Record<string, number> = {};
    const txIdType: Record<string, TxType> = {};
    const txStatusesCount: Record<
      string,
      Record<AggregateTxStatus, number>
    > = {};

    for (const guardStatus of statuses) {
      statusesCount[eventStatusToAggregate(guardStatus.status)] += 1;

      if (!guardStatus.txId) continue;

      if (!txStatusesCount[guardStatus.txId]) {
        txIdCount[guardStatus.txId] = 0;
        txIdType[guardStatus.txId] = guardStatus.txType!;
        txStatusesCount[guardStatus.txId] = {
          [AggregateTxStatus.completed]: 0,
          [AggregateTxStatus.sign]: 0,
          [AggregateTxStatus.signed]: 0,
          [AggregateTxStatus.sent]: 0,
          [AggregateTxStatus.invalid]: 0,
          [AggregateTxStatus.waitingForConfirmation]: 0,
        };
      }

      txIdCount[guardStatus.txId] += 1;

      txStatusesCount[guardStatus.txId][
        txStatusToAggregate(guardStatus.txStatus!)
      ] += 1;
    }

    for (const threshold of eventStatusThresholds) {
      if (statusesCount[threshold[0]] >= threshold[1]) {
        majority.status = threshold[0];
        break;
      }
    }

    if (Object.keys(txIdCount).length > 0) {
      // TODO: select tx by majority?
      majority.txId = Object.entries(txIdCount).toSorted(
        (a, b) => b[1] - a[1],
      )[0][0];
      majority.txType = txIdType[majority.txId];

      for (const threshold of txStatusThresholds) {
        if (txStatusesCount[majority.txId!][threshold[0]] >= threshold[1]) {
          majority.txStatus = threshold[0];
          break;
        }
      }

      if (!majority.txStatus) {
        majority.txStatus = AggregateTxStatus.waitingForConfirmation;
      }
    }
  }

  return majority;
}

export function eventStatusToAggregate(
  status: EventStatus,
): AggregateEventStatus {
  switch (status) {
    case EventStatus.inPayment:
      return AggregateEventStatus.inPayment;
    case EventStatus.pendingPayment:
      return AggregateEventStatus.pendingPayment;
    case EventStatus.pendingReward:
      return AggregateEventStatus.pendingReward;
    case EventStatus.inReward:
      return AggregateEventStatus.inReward;
    case EventStatus.completed:
      return AggregateEventStatus.finished;
    case EventStatus.spent:
      return AggregateEventStatus.finished;
    case EventStatus.rejected:
      return AggregateEventStatus.rejected;
    case EventStatus.timeout:
      return AggregateEventStatus.timeout;
    case EventStatus.reachedLimit:
      return AggregateEventStatus.reachedLimit;
    case EventStatus.paymentWaiting:
      return AggregateEventStatus.paymentWaiting;
    case EventStatus.rewardWaiting:
      return AggregateEventStatus.rewardWaiting;
  }
}

export function txStatusToAggregate(status: TxStatus): AggregateTxStatus {
  switch (status) {
    case TxStatus.approved:
      return AggregateTxStatus.sign;
    case TxStatus.inSign:
      return AggregateTxStatus.sign;
    case TxStatus.signFailed:
      return AggregateTxStatus.sign;
    case TxStatus.signed:
      return AggregateTxStatus.signed;
    case TxStatus.sent:
      return AggregateTxStatus.sent;
    case TxStatus.invalid:
      return AggregateTxStatus.invalid;
  }
}

export type StatusChangedDTO = {
  insertedAt: number;
  status: AggregateEventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: AggregateTxStatus;
};

export function statusChangedToDTO(
  record: StatusChangedEntity,
): StatusChangedDTO {
  return {
    insertedAt: record.insertedAt,
    status: record.status,
    txId: record.txId,
    txType: record.txType,
    txStatus: record.txStatus,
  };
}

export type GuardStatusChangedDTO = {
  guardPk: string;
  insertedAt: number;
  status: EventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: TxStatus;
};

export function guardStatusChangedToDTO(
  record: GuardStatusChangedEntity,
): GuardStatusChangedDTO {
  return {
    guardPk: record.guardPk,
    insertedAt: record.insertedAt,
    status: record.status,
    txId: record.txId,
    txType: record.txType,
    txStatus: record.txStatus,
  };
}
