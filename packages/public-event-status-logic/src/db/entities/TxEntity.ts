import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { TxType } from '../../constants';
import { GuardStatusChangedEntity } from './GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from './OverallStatusChangedEntity';

@Entity()
export class TxEntity {
  @PrimaryColumn('varchar')
  txId: string;

  @Column('varchar')
  eventId: string;

  @Column('integer')
  insertedAt: number;

  @Column('varchar')
  txType: TxType;

  @OneToMany(() => OverallStatusChangedEntity, (record) => record.tx)
  overallStatusChangedRecords: OverallStatusChangedEntity[];

  @OneToMany(() => GuardStatusChangedEntity, (record) => record.tx)
  guardStatusChangedRecords: GuardStatusChangedEntity[];
}
