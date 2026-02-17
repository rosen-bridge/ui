import { Column, Entity, PrimaryColumn } from '@rosen-bridge/extended-typeorm';
import { Network } from '@rosen-ui/types';

import { AbstractAssetEntity } from './abstractAssetEntity';

@Entity('bridged_asset_entity')
export class BridgedAssetEntity extends AbstractAssetEntity {
  @PrimaryColumn('varchar')
  chain: Network;

  @Column('varchar')
  bridgedTokenId: string;
}
