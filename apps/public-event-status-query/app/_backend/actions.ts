import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatusActions,
  TxType,
  OverallStatusChangedEntity,
  EventStatus,
  TxStatus,
  GuardStatusChangedEntity,
} from '@rosen-bridge/public-event-status-logic';

import './initialize-if-needed';

/**
 * a response type used in api
 */
export type OverallStatusChangedDTO = {
  insertedAt: number;
  status: AggregateEventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: AggregateTxStatus;
};

/**
 * helper function to map OverallStatusChangedEntity to its DTO
 * @param record
 * @returns OverallStatusChangedDTO
 */
export function overallStatusChangedToDTO(
  record: OverallStatusChangedEntity,
): OverallStatusChangedDTO {
  return {
    insertedAt: record.insertedAt,
    status: record.status,
    txId: record.tx?.txId,
    txType: record.tx?.txType,
    txStatus: record.txStatus ?? undefined,
  };
}

/**
 * a response type used in api
 */
export type GuardStatusChangedDTO = {
  guardPk: string;
  insertedAt: number;
  status: EventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: TxStatus;
};

/**
 * helper function to map GuardStatusChangedEntity to its DTO
 * @param record
 * @returns GuardStatusChangedDTO
 */
export function guardStatusChangedToDTO(
  record: GuardStatusChangedEntity,
): GuardStatusChangedDTO {
  return {
    guardPk: record.guardPk,
    insertedAt: record.insertedAt,
    status: record.status,
    txId: record.tx?.txId,
    txType: record.tx?.txType,
    txStatus: record.txStatus ?? undefined,
  };
}

export { EventStatusActions };
