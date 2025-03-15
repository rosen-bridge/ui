import { AggregateEventStatus, AggregateTxStatus } from './constants';

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
