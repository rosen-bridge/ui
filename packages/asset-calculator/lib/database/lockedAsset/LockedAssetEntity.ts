import { BigIntValueTransformer } from '@rosen-bridge/extended-typeorm';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { TokenEntity } from '../token/TokenEntity';

@Entity('locked_asset_entity')
export class LockedAssetEntity {
  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  amount: bigint;

  @PrimaryColumn('varchar')
  address: string;

  /**
   * In order to create a foreign key primary column, we need to include the
   * relation column (tokenId in this case) in addition to the relation itself
   */
  @PrimaryColumn('varchar')
  tokenId: string;

  @ManyToOne(() => TokenEntity, 'id')
  token: TokenEntity;
}
