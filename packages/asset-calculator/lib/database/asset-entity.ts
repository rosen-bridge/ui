import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BigIntValueTransformer } from '@rosen-bridge/extended-typeorm';

@Entity()
export class AssetEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  decimal: number;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  amount: bigint;
}
