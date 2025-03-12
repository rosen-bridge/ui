import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from './constants';

/**
 * used for defining aggregated status thresholds of both event and tx
 */
export type Threshold<T> = {
  status: T;
  count: number;
}[];

/**
 * result of aggregate calculation
 */
export type AggregatedStatus = {
  status: AggregateEventStatus;
  txStatus: AggregateTxStatus;
  tx?: {
    txId: string;
    chain: string;
  };
};

/**
 * input type used for calculating aggregate
 */
export type StatusForAggregate = {
  guardPk: string;
  status: EventStatus;
  tx?: {
    txId: string;
    chain: string;
    txStatus: TxStatus;
  };
};
