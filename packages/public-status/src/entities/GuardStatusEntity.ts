import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from '@rosen-bridge/extended-typeorm';

import { EventStatus, TxStatus } from '../constants';
import { TxEntity } from './TxEntity';

@Entity()
export class GuardStatusEntity {
  @PrimaryColumn('varchar')
  eventId: string;

  @PrimaryColumn('varchar')
  guardPk: string;

  @Column('integer')
  updatedAt: number;

  @Column('varchar')
  status: EventStatus;

  @ManyToOne(() => TxEntity, (tx) => tx.guardStatusRecords, {
    cascade: false,
    nullable: true,
    eager: true,
  })
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
