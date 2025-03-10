import {
  AggregateEventStatus,
  AggregateTxStatus,
  PublicStatusActions,
  TxType,
  AggregatedStatusChangedEntity,
  EventStatus,
  TxStatus,
  GuardStatusChangedEntity,
  AggregatedStatusEntity,
} from '@rosen-bridge/public-status-logic';

import './initialize-if-needed';

/**
 * a response type used in api
 */
export type AggregatedStatusChangedDTO = {
  insertedAt: number;
  status: AggregateEventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: AggregateTxStatus;
};

/**
 * helper function to map AggregatedStatusChangedEntity to its DTO
 * @param record
 * @returns AggregatedStatusChangedDTO
 */
export function aggregatedStatusChangedToDTO(
  record: AggregatedStatusChangedEntity,
): AggregatedStatusChangedDTO {
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
export type AggregatedStatusDTO = {
  updatedAt: number;
  status: AggregateEventStatus;
  txId?: string;
  txType?: TxType;
  txStatus?: AggregateTxStatus;
};

/**
 * helper function to map AggregatedStatusEntity to its DTO
 * @param record
 * @returns AggregatedStatusDTO
 */
export function aggregatedStatusToDTO(
  record: AggregatedStatusEntity,
): AggregatedStatusDTO {
  return {
    updatedAt: record.updatedAt,
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

export { PublicStatusActions };
