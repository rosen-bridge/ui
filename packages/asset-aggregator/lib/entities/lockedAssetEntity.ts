import { Entity, PrimaryColumn } from '@rosen-bridge/extended-typeorm';

import { AbstractAssetEntity } from './abstractAssetEntity';

@Entity('locked_asset_entity')
export class LockedAssetEntity extends AbstractAssetEntity {
  @PrimaryColumn('varchar')
  address: string;
}
