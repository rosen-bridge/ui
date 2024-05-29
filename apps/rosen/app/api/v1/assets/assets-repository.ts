import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-calculator';

import dataSource from '../../../_backend/dataSource';

const bridgedAssetRepository = dataSource.getRepository(BridgedAssetEntity);
const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);

interface AssetWithTotal {
  id: string;
  name: string;
  decimal: number;
  isNative: boolean;
  bridged: string;
  locked: string;
  chain: string;
  total: number;
}
export type AssetFilters = Partial<
  Pick<AssetWithTotal, 'chain' | 'name' | 'id'>
>;

/**
 * remove total field from rawItems returned by query in getAssets
 * @param rawItems
 */
const getItemsWithoutTotal = (rawItems: AssetWithTotal[]) =>
  rawItems.map(({ total, ...item }) => item);

/**
 * get paginated list of assets
 * @param offset
 * @param limit
 * @param filters
 */
export const getAssets = async (
  offset: number,
  limit: number,
  filters: AssetFilters = {},
) => {
  const rawItems: AssetWithTotal[] = await tokenRepository
    .createQueryBuilder('te')
    .leftJoin(
      (queryBuilder) =>
        queryBuilder
          .select(['bae.tokenId AS "tokenId"', 'sum(bae.amount) AS "bridged"'])
          .from(bridgedAssetRepository.metadata.tableName, 'bae')
          .groupBy('bae.tokenId'),
      'baeq',
      'baeq."tokenId" = te.id',
    )
    .leftJoin(
      (queryBuilder) =>
        queryBuilder
          .select(['lae.tokenId AS "tokenId"', 'sum(lae.amount) AS "locked"'])
          .from(lockedAssetRepository.metadata.tableName, 'lae')
          .groupBy('lae.tokenId'),
      'laeq',
      'laeq."tokenId" = te.id',
    )
    .select([
      'id',
      'name',
      'decimal',
      '"isNative"',
      '"bridged"',
      '"locked"',
      'chain',
      'count(*) over() AS total',
    ])
    .where(filters)
    .offset(offset)
    .limit(limit)
    .getRawMany();

  const items = getItemsWithoutTotal(rawItems);

  return {
    items,
    total: rawItems[0]?.total ?? 0,
  };
};
