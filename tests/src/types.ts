import {
  EventStatus as EventStatusEnum,
  TxStatus as TxStatusEnum,
} from '@rosen-ui/public-status';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  guardPks,
  SUPPORTED_CHAINS,
  TxType,
} from './constants';

export type StatusRecord = {
  id: number;
  eventId: string;
  guardPk: GuardPK;
  insertedAt: number;
  status: EventStatus;
  txStatus?: TxStatus;
  txId?: string;
  txChain?: SupportedChain;
};

export type StatusTxRecord = {
  txId: string;
  txChain: SupportedChain;
};

export type StatusDTO = {
  date: number;
  eventId: string;
  status: EventStatus;
  pk: GuardPK;
  signature: string;
  tx?: TxDTO;
};

export type TxDTO = {
  txId: string;
  chain: SupportedChain;
  txType: TxType;
  txStatus: TxStatus;
};

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];
export type GuardPK = (typeof guardPks)[number];

export type EventStatus = `${EventStatusEnum}`;
export type TxStatus = `${TxStatusEnum}`;

export type GuardStatusRecord = {
  eventId: string;
  guardPk: string;
  updatedAt: number;
  status: EventStatus;
  txStatus?: TxStatus;
  txId?: string;
  txChain?: SupportedChain;
};

export type GuardStatusChangedRecord = {
  id: number;
  eventId: string;
  guardPk: string;
  insertedAt: number;
  status: EventStatus;
  txStatus?: TxStatus;
  txId?: string;
  txChain?: SupportedChain;
};

export type AggregatedStatusRecord = {
  eventId: string;
  updatedAt: number;
  status: AggregateEventStatus;
  txStatus?: AggregateTxStatus;
  txId?: string;
  txChain?: string;
};

export type AggregatedStatusChangedRecord = {
  id: number;
  eventId: string;
  insertedAt: number;
  status: AggregateEventStatus;
  txStatus?: AggregateTxStatus;
  txId?: string;
  txChain?: string;
};

export type TxRecord = {
  txId: string;
  chain: SupportedChain;
  eventId: string;
  insertedAt: number;
  txType: TxType;
};

export type Expectations = {
  guardStatusEntities: GuardStatusRecord[];
  guardStatusChangedEntities: GuardStatusChangedRecord[];
  aggregatedStatusEntities: AggregatedStatusRecord[];
  aggregatedStatusChangedEntities: AggregatedStatusChangedRecord[];
  txEntities: TxRecord[];
};

export type TestCase = {
  records: StatusRecord[];
  expectations: Expectations;
};
