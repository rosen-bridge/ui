import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { TxType } from '../../constants';
import { AggregatedStatusChangedEntity } from './AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from './AggregatedStatusEntity';
import { GuardStatusChangedEntity } from './GuardStatusChangedEntity';
import { GuardStatusEntity } from './GuardStatusEntity';

@Entity()
export class TxEntity {
  @PrimaryColumn('varchar')
  txId: string;

  @PrimaryColumn('varchar')
  chain: string;

  @Column('varchar')
  eventId: string;

  @Column('integer')
  insertedAt: number;

  @Column('varchar')
  txType: TxType;

  @OneToMany(() => AggregatedStatusEntity, (record) => record.tx)
  aggregatedStatusRecords?: Promise<AggregatedStatusEntity[]>;

  @OneToMany(() => AggregatedStatusChangedEntity, (record) => record.tx)
  aggregatedStatusChangedRecords?: Promise<AggregatedStatusChangedEntity[]>;

  @OneToMany(() => GuardStatusEntity, (record) => record.tx)
  guardStatusRecords?: Promise<GuardStatusEntity[]>;

  @OneToMany(() => GuardStatusChangedEntity, (record) => record.tx)
  guardStatusChangedRecords?: Promise<GuardStatusChangedEntity[]>;
}
