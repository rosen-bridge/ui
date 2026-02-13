import {
  BigIntValueTransformer,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from '@rosen-bridge/extended-typeorm';
import { Network } from '@rosen-ui/types';

import { TokenEntity } from './tokenEntity';

@Entity('bridged_asset_entity')
export class BridgedAssetEntity {
  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  amount: bigint;

  @PrimaryColumn('varchar')
  chain: Network;

  /**
   * In order to create a foreign key primary column, we need to include the
   * relation column (tokenId in this case) in addition to the relation itself
   */
  @PrimaryColumn('varchar')
  tokenId: string;

  @ManyToOne(() => TokenEntity)
  @JoinColumn({ name: 'tokenId', referencedColumnName: 'id' })
  token: TokenEntity;

  @Column('varchar')
  bridgedTokenId: string;
}
