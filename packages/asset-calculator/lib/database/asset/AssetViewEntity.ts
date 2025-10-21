import { ViewEntity, ViewColumn } from '@rosen-bridge/extended-typeorm';
import { Network } from '@rosen-ui/types';

@ViewEntity({
  name: 'asset_view',
  expression: (dataSource) =>
    dataSource
      .createQueryBuilder()
      .select('te.id', 'id')
      .addSelect('te.name', 'name')
      .addSelect('te.decimal', 'decimal')
      .addSelect('te."isNative"', 'isNative')
      .addSelect('baeq."bridged"', 'bridged')
      .addSelect('laeq."lockedPerAddress"', 'lockedPerAddress')
      .addSelect('te.chain', 'chain')
      .from('token_entity', 'te')
      .leftJoin(
        (queryBuilder) =>
          queryBuilder
            .select('bae."tokenId"', '"tokenId"')
            .addSelect('SUM(bae.amount)', '"bridged"')
            .from('bridged_asset_entity', 'bae')
            .groupBy('bae."tokenId"'),
        'baeq',
        'baeq."tokenId" = te.id',
      )
      .leftJoin(
        (queryBuilder) =>
          queryBuilder
            .select('lae."tokenId"', '"tokenId"')
            .addSelect(
              `JSONB_AGG(to_jsonb(lae) - 'tokenId')`,
              '"lockedPerAddress"',
            )
            .from('locked_asset_entity', 'lae')
            .groupBy('lae."tokenId"'),
        'laeq',
        'laeq."tokenId" = te.id',
      ),
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
  bridged!: string | null;

  @ViewColumn()
  lockedPerAddress!: Array<{ address: string; amount: number }> | null;
}
