import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import {
  TxType,
  AggregateTxStatus,
  AggregateEventStatus,
} from '../../constants';

@Entity()
export class StatusChangedEntity {
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

  @Column('varchar', {
    nullable: true,
  })
  txId?: string;

  @Column('varchar', {
    nullable: true,
  })
  txType?: TxType;

  @Column('varchar', {
    nullable: true,
  })
  txStatus?: AggregateTxStatus;
}
