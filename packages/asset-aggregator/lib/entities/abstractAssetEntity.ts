import {
  BigIntValueTransformer,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from '@rosen-bridge/extended-typeorm';

import { TokenEntity } from './tokenEntity';

@Entity('bridged_asset_entity')
export abstract class AbstractAssetEntity {
  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  amount: bigint;

  /**
   * In order to create a foreign key primary column, we need to include the
   * relation column (tokenId in this case) in addition to the relation itself
   */
  @PrimaryColumn('varchar')
  tokenId: string;

  @ManyToOne(() => TokenEntity)
  @JoinColumn({ name: 'tokenId', referencedColumnName: 'id' })
  token: TokenEntity;
}
