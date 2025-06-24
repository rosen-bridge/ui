import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { AggregateTxStatus, AggregateEventStatus } from '../../constants';
import { TxEntity } from './TxEntity';

@Entity()
export class AggregatedStatusEntity {
  @PrimaryColumn('varchar')
  eventId: string;

  @Column('integer')
  updatedAt: number;

  @Column('varchar')
  status: AggregateEventStatus;

  @Column('varchar', { nullable: true })
  txStatus: AggregateTxStatus | null;

  @ManyToOne(() => TxEntity, (tx) => tx.aggregatedStatusRecords, {
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
