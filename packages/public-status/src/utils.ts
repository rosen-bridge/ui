import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from './constants';
import { GuardStatusEntity } from './entities/GuardStatusEntity';
import { AggregatedStatus, Threshold } from './types';

export class Utils {
  /**
   * compares two records of AggregatedStatus
   * @param s1
   * @param s2
   * @returns boolean
   */
  static aggregatedStatusesMatch = (
    s1: AggregatedStatus,
    s2: AggregatedStatus,
  ): boolean => {
    return (
      s1.status === s2.status &&
      s1.txStatus === s2.txStatus &&
      s1.tx?.txId === s2.tx?.txId &&
      s1.tx?.chain === s2.tx?.chain
    );
  };

  /**
   * encodes a guard status to a string AggregateEventStatus
   * @param guardStatus
   * @returns event status as string
   */
  static encodeEventStatus = (guardStatus: GuardStatusEntity): string => {
    return `${this.eventStatusToAggregate(guardStatus.status)}`;
  };

  /**
   * encodes a guard status to a string AggregateTxStatus if available
   * @param guardStatus
   * @returns tx status as string or undefined if tx is not available
   */
  static encodeTxStatus = (
    guardStatus: GuardStatusEntity,
  ): string | undefined => {
    if (!guardStatus.tx) return undefined;
    const txKey = JSON.stringify({
      txId: guardStatus.tx!.txId,
      chain: guardStatus.tx!.chain,
    });
    return `${txKey}::${this.txStatusToAggregate(guardStatus.txStatus!)}`;
  };

  /**
   * counts matching strings in an array
   * @param items
   * @returns counts object with the string as key and count number as value
   */
  static countSimilar = (items: string[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      if (!counts[item]) {
        counts[item] = 1;
        return;
      }
      counts[item] += 1;
    });
    return counts;
  };

  /**
   * compares thresholds with counts in order
   * @param counts
   * @param thresholds
   * @returns triggered threshold or undefined if counts are lower than thresholds
   */
  static checkThresholds = <T>(
    counts: Record<string, number>,
    thresholds: Threshold<T>[],
  ): T | undefined => {
    for (const threshold of thresholds) {
      const count = counts[`${threshold.key}`] ?? 0;
      if (count >= threshold.count) return threshold.key;
    }
    return undefined;
  };

  /**
   * calculates the aggregated event status
   * @param guardStatuses
   * @param eventStatusThresholds
   * @returns AggregateEventStatus or undefined if counts are lower than thresholds
   */
  static getAggregatedEventStatus = (
    guardStatuses: GuardStatusEntity[],
    eventStatusThresholds: Threshold<AggregateEventStatus>[],
  ): AggregateEventStatus | undefined => {
    const statuses = guardStatuses.map(this.encodeEventStatus);
    const counts = this.countSimilar(statuses);
    return this.checkThresholds(counts, eventStatusThresholds);
  };

  /**
   * calculates the aggregated tx status
   * @param guardStatuses
   * @param txStatusThresholds
   * @returns AggregateTxStatus or undefined if counts are lower than thresholds
   */
  static getAggregatedTxStatus = (
    guardStatuses: GuardStatusEntity[],
    txStatusThresholds: Threshold<AggregateTxStatus>[],
  ): string | undefined => {
    const statuses = guardStatuses
      .map(this.encodeTxStatus)
      .filter((v) => !!v) as string[];
    const counts = this.countSimilar(statuses);

    for (const encodedStatus of Object.keys(counts)) {
      const parts = encodedStatus.split('::');
      const txStatus = parts[1];
      const trigger = this.checkThresholds(
        { [txStatus]: counts[encodedStatus] },
        txStatusThresholds,
      );
      if (trigger) return encodedStatus;
    }
    return undefined;
  };

  /**
   * calculates the aggregated status
   * @param statuses
   * @returns AggregatedStatus
   */
  static calcAggregatedStatus = (
    statuses: GuardStatusEntity[],
    eventStatusThresholds: Threshold<AggregateEventStatus>[],
    txStatusThresholds: Threshold<AggregateTxStatus>[],
  ): AggregatedStatus => {
    const aggregatedStatus: AggregatedStatus = {
      status: AggregateEventStatus.waitingForConfirmation,
      txStatus: undefined,
      tx: undefined,
    };
    if (statuses.length === 0) {
      return aggregatedStatus;
    }

    const aggregatedEventStatus = this.getAggregatedEventStatus(
      statuses,
      eventStatusThresholds,
    );
    if (!aggregatedEventStatus) {
      return aggregatedStatus;
    }

    aggregatedStatus.status = aggregatedEventStatus;
    if (
      ![AggregateEventStatus.inPayment, AggregateEventStatus.inReward].includes(
        aggregatedEventStatus,
      )
    ) {
      return aggregatedStatus;
    }

    const aggregatedTxStatus = this.getAggregatedTxStatus(
      statuses,
      txStatusThresholds,
    );
    if (!aggregatedTxStatus) {
      return aggregatedStatus;
    }

    const parts = aggregatedTxStatus.split('::');
    aggregatedStatus.tx = JSON.parse(parts[0]);
    aggregatedStatus.txStatus = parts[1] as AggregateTxStatus;
    return aggregatedStatus;
  };

  /**
   * helper function to map EventStatus to AggregateEventStatus
   * @param status
   * @returns AggregateEventStatus
   */
  static eventStatusToAggregate = (
    status: EventStatus,
  ): AggregateEventStatus => {
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
  };

  /**
   * helper function to map TxStatus to AggregateTxStatus
   * @param status
   * @returns AggregateTxStatus
   */
  static txStatusToAggregate = (status: TxStatus): AggregateTxStatus => {
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
      case TxStatus.completed:
        return AggregateTxStatus.completed;
    }
  };

  /**
   * clones an object omitting the specified fields
   * @typeParam T - the type of the input object
   * @typeParam K - the keys of the object to omit
   * @param obj - the source object to clone
   * @param fieldsToOmit - an array containing keys that should be omitted from the clone
   * @returns a new object that includes all keys of the original object except for those specified in fieldsToOmit
   */
  static cloneOmitting = <T extends object, K extends keyof T>(
    obj: T,
    fieldsToOmit: K[],
  ): Omit<T, K> => {
    const result = {} as Omit<T, K>;

    (Object.keys(obj) as (keyof T)[]).forEach((key) => {
      if (!fieldsToOmit.includes(key as K)) {
        const typedKey = key as Exclude<keyof T, K>;
        result[typedKey] = obj[typedKey];
      }
    });

    return result;
  };

  /**
   * clones an array by filtering out objects where the specified key matches a given value and then pushes a new object into the cloned array
   * @typeParam T - the type of elements in the array
   * @typeParam K - a key from the type T
   * @param arr - the original array to be cloned
   * @param key - the property key to compare against the value
   * @param value - the value to filter out from the array
   * @param newObj - the new object to push into the cloned array
   * @returns a new array that is a clone of the original, with the specified objects filtered out and the new object added
   */
  static cloneFilterPush = <T, K extends keyof T>(
    arr: T[],
    key: K,
    value: T[K],
    newObj: T,
  ): T[] => {
    const clonedArray = arr.filter((item) => item[key] !== value);
    clonedArray.push(newObj);
    return clonedArray;
  };
}
