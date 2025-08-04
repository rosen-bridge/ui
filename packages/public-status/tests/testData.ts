import { TxType, TxStatus, EventStatus } from '../src/constants';
import { GuardStatusEntity } from '../src/entities/GuardStatusEntity';
import { TxEntity } from '../src/entities/TxEntity';

export const id0 =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const id1 =
  '0000000000000000000000000000000000000000000000000000000000000001';

export const guardPk0 =
  '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1';
export const guardPk1 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6';
export const guardPk2 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c7';
export const guardPk3 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c8';
export const guardPk4 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c9';

export const mockTx0: TxEntity = {
  txId: id1,
  chain: 'c1',
  eventId: id0,
  insertedAt: 0,
  txType: TxType.payment,
};

export const mockGuardStatusRecords: Omit<GuardStatusEntity, 'id'>[] = [
  {
    eventId: id1,
    guardPk: guardPk0,
    updatedAt: 1010,
    status: EventStatus.pendingPayment,
    tx: null,
    txStatus: null,
  },
  {
    eventId: id0,
    guardPk: guardPk0,
    updatedAt: 1005,
    status: EventStatus.inPayment,
    tx: mockTx0,
    txStatus: TxStatus.signed,
  },
  {
    eventId: id0,
    guardPk: guardPk1,
    updatedAt: 1001,
    status: EventStatus.timeout,
    tx: null,
    txStatus: null,
  },
];
