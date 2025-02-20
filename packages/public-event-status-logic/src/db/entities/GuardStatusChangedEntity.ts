import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { EventStatus, TxType, TxStatus } from '../../constants';

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
  txStatus?: TxStatus;
}
