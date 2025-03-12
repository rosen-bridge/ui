import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from './constants';
import { GuardStatusEntity } from './db/entities/GuardStatusEntity';
import { eventStatusThresholds, txStatusThresholds } from './thresholds';
import { AggregatedStatus, StatusForAggregate } from './types';

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
      s1.txStatus === s2.txStatus &&
      s1.tx?.txId === s2.tx?.txId &&
      s1.tx?.chain === s2.tx?.chain
    );
  }

  /**
   * maps a GuardStatusEntity to StatusForAggregate
   * @param guardStatus
   * @returns StatusForAggregate
   */
  static mapGuardStatusForAggregate(
    guardStatus: GuardStatusEntity,
  ): StatusForAggregate {
    return {
      guardPk: guardStatus.guardPk,
      status: guardStatus.status,
      tx:
        guardStatus.tx && guardStatus.txStatus
          ? {
              txId: guardStatus.tx.txId,
              chain: guardStatus.tx.chain,
              txStatus: guardStatus.txStatus,
            }
          : undefined,
    };
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
      txStatus: AggregateTxStatus.waitingForConfirmation,
      tx: undefined,
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

    const txKeyCount: Record<string, number> = {};
    const txStatusesCount: Record<
      string,
      Record<AggregateTxStatus, number>
    > = {};

    for (const status of statuses) {
      statusesCount[this.eventStatusToAggregate(status.status)] += 1;

      if (!status.tx) continue;

      const txKey = JSON.stringify({
        txId: status.tx!.txId,
        chain: status.tx!.chain,
      });

      if (!txStatusesCount[txKey]) {
        txKeyCount[txKey] = 0;
        // for each case of AggregateTxStatus init its count to 0
        txStatusesCount[txKey] = Object.values(AggregateTxStatus).reduce(
          (obj, status) => {
            obj[status] = 0;
            return obj;
          },
          {} as Record<AggregateTxStatus, number>,
        );
      }

      txKeyCount[txKey] += 1;
      txStatusesCount[txKey][this.txStatusToAggregate(status.tx!.txStatus)] +=
        1;
    }

    for (const threshold of eventStatusThresholds) {
      if (statusesCount[threshold.status] >= threshold.count) {
        aggregatedStatus.status = threshold.status;
        break;
      }
    }

    if (Object.keys(txKeyCount).length > 0) {
      for (const txKey in txKeyCount) {
        if (txKeyCount[txKey] === 0) continue;
        for (const threshold of txStatusThresholds) {
          if (txStatusesCount[txKey][threshold.status] >= threshold.count) {
            aggregatedStatus.tx = JSON.parse(txKey);
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

  /**
   * clones an object omitting the specified fields
   *
   * @typeParam T - the type of the input object
   * @typeParam K - the keys of the object to omit
   * @param obj - the source object to clone
   * @param fieldsToOmit - an array containing keys that should be omitted from the clone
   * @returns a new object that includes all keys of the original object except for those specified in fieldsToOmit
   */
  static cloneOmitting<T extends object, K extends keyof T>(
    obj: T,
    fieldsToOmit: K[],
  ): Omit<T, K> {
    const result = {} as Omit<T, K>;

    (Object.keys(obj) as (keyof T)[]).forEach((key) => {
      if (!fieldsToOmit.includes(key as K)) {
        const typedKey = key as Exclude<keyof T, K>;
        result[typedKey] = obj[typedKey];
      }
    });

    return result;
  }
}
