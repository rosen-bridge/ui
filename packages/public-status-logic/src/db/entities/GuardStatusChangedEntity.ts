import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EventStatus, TxStatus } from '../../constants';
import { TxEntity } from './TxEntity';

@Entity()
export class GuardStatusChangedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  @Index()
  eventId: string;

  @Column('varchar')
  @Index()
  guardPk: string;

  @Column('integer')
  @Index()
  insertedAt: number;

  @Column('varchar')
  status: EventStatus;

  @ManyToOne(() => TxEntity, (tx) => tx.guardStatusChangedRecords, {
    cascade: false,
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'txId' })
  tx: TxEntity | null;

  @Column('varchar', {
    nullable: true,
  })
  txStatus: TxStatus | null;
}
