import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BigIntValueTransformer } from '@rosen-bridge/extended-typeorm';

@Entity()
export class AssetEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  name: string;

  @Column('int')
  decimal: number;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  amount: bigint;

  @Column('boolean')
  isNative: boolean;
}
