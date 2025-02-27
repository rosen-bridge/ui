import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AggregateTxStatus, AggregateEventStatus } from '../../constants';
import { TxEntity } from './TxEntity';

@Entity()
export class OverallStatusChangedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  @Index()
  eventId: string;

  @Column('integer')
  @Index()
  insertedAt: number;

  @Column('varchar')
  status: AggregateEventStatus;

  @ManyToOne(() => TxEntity, (tx) => tx.overallStatusChangedRecords, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  tx: TxEntity | null;

  @Column('varchar', {
    nullable: true,
  })
  txStatus: AggregateTxStatus | null;
}
