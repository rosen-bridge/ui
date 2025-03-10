import { AggregateEventStatus, AggregateTxStatus } from './constants';

export type EventStatusThreshold = {
  status: AggregateEventStatus;
  count: number;
}[];
export type TxStatusThreshold = { status: AggregateTxStatus; count: number }[];

// TODO: read from env or default
export const eventStatusThresholds: EventStatusThreshold = [
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
export const txStatusThresholds: TxStatusThreshold = [
  { status: AggregateTxStatus.completed, count: 6 },
  { status: AggregateTxStatus.invalid, count: 6 },
  { status: AggregateTxStatus.sent, count: 6 },
  { status: AggregateTxStatus.signed, count: 3 },
  { status: AggregateTxStatus.inSign, count: 6 },
];
