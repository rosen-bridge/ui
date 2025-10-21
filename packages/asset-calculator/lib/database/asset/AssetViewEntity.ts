import { ViewEntity, ViewColumn } from '@rosen-bridge/extended-typeorm';
import { Network } from '@rosen-ui/types';

@ViewEntity({
  name: 'asset_view',
})
export class AssetViewEntity {
  @ViewColumn()
  id!: string;

  @ViewColumn()
  name!: string;

  @ViewColumn()
  decimal!: number;

  @ViewColumn()
  isNative!: boolean;

  @ViewColumn()
  chain!: Network;

  @ViewColumn()
  bridged!: string;

  @ViewColumn()
  lockedPerAddress!: Array<{ address: string; amount: number }>;
}
