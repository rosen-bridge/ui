import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AggregateTxStatus, AggregateEventStatus } from '../../constants';
import { TxEntity } from './TxEntity';

@Entity()
export class AggregatedStatusChangedEntity {
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

  @Column('varchar')
  txStatus: AggregateTxStatus;

  @ManyToOne(() => TxEntity, (tx) => tx.aggregatedStatusChangedRecords, {
    cascade: false,
    nullable: true,
    eager: true,
  })
  @JoinColumn([
    { name: 'txId', referencedColumnName: 'txId' },
    { name: 'txChain', referencedColumnName: 'chain' },
  ])
  tx: TxEntity | null;
}
