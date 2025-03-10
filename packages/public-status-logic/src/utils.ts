import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from './constants';
import { eventStatusThresholds, txStatusThresholds } from './thresholds';

/**
 * result of aggregate calculation
 */
export type AggregatedStatus = {
  status: AggregateEventStatus;
  txId?: string;
  txStatus: AggregateTxStatus;
};

/**
 * input type used for calculating aggregate
 */
export type StatusForAggregate = {
  guardPk: string;
  status: EventStatus;
  txId?: string;
  txStatus?: TxStatus;
};

export class Utils {
  /**
   * compares two records of AggregatedStatus
   * @param s1
   * @param s2
   * @returns boolean
   */
  static aggregatedStatusesMatch(
    s1: AggregatedStatus,
    s2: AggregatedStatus,
  ): boolean {
    return (
      s1.status === s2.status &&
      s1.txId === s2.txId &&
      s1.txStatus === s2.txStatus
    );
  }

  /**
   * calculates the aggregated status
   * @param statuses
   * @returns AggregatedStatus
   */
  static calcAggregatedStatus(
    statuses: StatusForAggregate[],
  ): AggregatedStatus {
    const aggregatedStatus: AggregatedStatus = {
      status: AggregateEventStatus.waitingForConfirmation,
      txId: undefined,
      txStatus: AggregateTxStatus.waitingForConfirmation,
    };

    if (statuses.length === 0) {
      return aggregatedStatus;
    }

    // for each case of AggregateEventStatus init its count to 0
    const statusesCount = Object.values(AggregateEventStatus).reduce(
      (obj, status) => {
        obj[status] = 0;
        return obj;
      },
      {} as Record<AggregateEventStatus, number>,
    );

    const txIdCount: Record<string, number> = {};
    const txStatusesCount: Record<
      string,
      Record<AggregateTxStatus, number>
    > = {};

    for (const status of statuses) {
      statusesCount[this.eventStatusToAggregate(status.status)] += 1;

      if (!status.txId) continue;
      if (!txStatusesCount[status.txId]) {
        txIdCount[status.txId] = 0;
        // for each case of AggregateTxStatus init its count to 0
        txStatusesCount[status.txId] = Object.values(AggregateTxStatus).reduce(
          (obj, status) => {
            obj[status] = 0;
            return obj;
          },
          {} as Record<AggregateTxStatus, number>,
        );
      }

      txIdCount[status.txId] += 1;

      txStatusesCount[status.txId][
        this.txStatusToAggregate(status.txStatus!)
      ] += 1;
    }

    for (const threshold of eventStatusThresholds) {
      if (statusesCount[threshold.status] >= threshold.count) {
        aggregatedStatus.status = threshold.status;
        break;
      }
    }

    if (Object.keys(txIdCount).length > 0) {
      for (const txId in txIdCount) {
        if (txIdCount[txId] === 0) continue;
        for (const threshold of txStatusThresholds) {
          if (txStatusesCount[txId][threshold.status] >= threshold.count) {
            aggregatedStatus.txId = txId;
            aggregatedStatus.txStatus = threshold.status;
            break;
          }
        }
      }
    }

    return aggregatedStatus;
  }

  /**
   * helper function to map EventStatus to AggregateEventStatus
   * @param status
   * @returns AggregateEventStatus
   */
  static eventStatusToAggregate(status: EventStatus): AggregateEventStatus {
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

  /**
   * helper function to map TxStatus to AggregateTxStatus
   * @param status
   * @returns AggregateTxStatus
   */
  static txStatusToAggregate(status: TxStatus): AggregateTxStatus {
    switch (status) {
      case TxStatus.approved:
        return AggregateTxStatus.inSign;
      case TxStatus.inSign:
        return AggregateTxStatus.inSign;
      case TxStatus.signFailed:
        return AggregateTxStatus.inSign;
      case TxStatus.signed:
        return AggregateTxStatus.signed;
      case TxStatus.sent:
        return AggregateTxStatus.sent;
      case TxStatus.invalid:
        return AggregateTxStatus.invalid;
    }
  }
}
