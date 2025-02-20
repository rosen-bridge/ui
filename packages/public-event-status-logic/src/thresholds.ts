import { AggregateEventStatus, AggregateTxStatus } from './constants';

export type EventStatusThreshold = [AggregateEventStatus, number];
export type TxStatusThreshold = [AggregateTxStatus, number];

// TODO: read from env or default
export const eventStatusThresholds: EventStatusThreshold[] = [
  [AggregateEventStatus.finished, 6],
  [AggregateEventStatus.inReward, 3],
  [AggregateEventStatus.pendingReward, 3],
  [AggregateEventStatus.inPayment, 6],
  [AggregateEventStatus.rejected, 5],
  [AggregateEventStatus.timeout, 5],
  [AggregateEventStatus.reachedLimit, 5],
  [AggregateEventStatus.paymentWaiting, 5],
  [AggregateEventStatus.pendingPayment, 3],
];
export const txStatusThresholds: TxStatusThreshold[] = [
  [AggregateTxStatus.completed, 6],
  [AggregateTxStatus.invalid, 6],
  [AggregateTxStatus.sent, 6],
  [AggregateTxStatus.signed, 3],
  [AggregateTxStatus.sign, 6],
];
