import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from '@rosen-bridge/extended-typeorm';

import type { EventStatus, TxStatus } from '../constants';
import { TxEntity } from './TxEntity';

@Entity('guard_status_entity')
export class GuardStatusEntity {
  @PrimaryColumn('varchar')
  triggerTxId: string;

  @PrimaryColumn('varchar')
  guardPk: string;

  @Column('varchar')
  eventId: string;

  @Column('integer')
  updatedAt: number;

  @Column('varchar')
  status: EventStatus;

  @ManyToOne(
    () => TxEntity,
    (tx) => tx.guardStatusRecords,
    {
      cascade: false,
      nullable: true,
      eager: true,
    },
  )
  @JoinColumn([
    { name: 'txId', referencedColumnName: 'txId' },
    { name: 'txChain', referencedColumnName: 'chain' },
  ])
  tx: TxEntity | null;

  @Column('varchar', {
    nullable: true,
  })
  txStatus: TxStatus | null;
}
