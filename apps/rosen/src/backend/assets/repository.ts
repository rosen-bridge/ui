import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-calculator';
import { Network } from '@rosen-ui/types';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const bridgedAssetRepository = dataSource.getRepository(BridgedAssetEntity);
const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);

export interface Asset {
  id: string;
  name: string;
  decimal: number;
  isNative: boolean;
  bridged: string | null;
  lockedPerAddress?: Array<{ amount: number; address: string }>;
  chain: Network;
}

export type AssetFilters = Partial<Pick<Asset, 'chain' | 'name' | 'id'>>;

interface AssetWithTotal extends Asset {
  total: number;
}

export interface AssetRepository
  extends BridgedAssetEntity,
    TokenEntity,
    LockedAssetEntity {}

/**
 * get details of an asset, including its token info, plus locked and bridged
 * data
 * @param id
 */
export const getAsset = async (id: string) => {
  const token = await tokenRepository.findOne({
    where: { id },
  });

  if (!token) {
    throw new ReferenceError(`Token with id [${id}] not found`);
  }

  const bridged: Pick<
    BridgedAssetEntity,
    'amount' | 'chain' | 'bridgedTokenId'
  >[] = await bridgedAssetRepository.find({
    where: { tokenId: id },
    select: ['amount', 'chain', 'bridgedTokenId'],
  });

  const locked: Pick<LockedAssetEntity, 'amount' | 'address'>[] =
    await lockedAssetRepository.find({
      where: { tokenId: id },
      select: ['amount', 'address'],
    });

  return {
    token,
    bridged,
    locked,
  };
};

/**
 * get paginated list of assets
 * @param filters
 */
export const getAllAssets = async (filters: Filters) => {
  if (filters.search) filters.search.in ||= [];

  let { pagination, query, sort } = filtersToTypeorm(
    filters,
    (key) => `"sub".${key}`,
  );
  console.log(query);
  const subquery = tokenRepository
    .createQueryBuilder('te')
    .leftJoin(
      (qb) =>
        qb
          .select(['bae.tokenId AS "tokenId"', 'SUM(bae.amount) AS "bridged"'])
          .from(bridgedAssetRepository.metadata.tableName, 'bae')
          .groupBy('bae.tokenId'),
      'baeq',
      'baeq."tokenId" = te.id',
    )
    .leftJoin(
      (qb) =>
        qb
          .select([
            'lae.tokenId AS "tokenId"',
            `jsonb_agg(to_jsonb(lae) - 'tokenId') AS "lockedPerAddress"`,
          ])
          .from(lockedAssetRepository.metadata.tableName, 'lae')
          .groupBy('lae.tokenId'),
      'laeq',
      'laeq."tokenId" = te.id',
    )
    .select([
      'te.id AS "id"',
      'te.name AS "name"',
      'CAST(te.decimal AS BIGINT) AS "decimal"',
      'te.isNative AS "isNative"',
      'baeq."bridged" AS "bridged"',
      'laeq."lockedPerAddress" AS "lockedPerAddress"',
      'te.chain AS "chain"',
    ]);

  let queryBuilder = dataSource
    .createQueryBuilder()
    .select(['sub.*', 'COUNT(*) OVER() AS "total"'])
    .from(`(${subquery.getQuery()})`, 'sub')
    .setParameters(subquery.getParameters());

  if (query) {
    const numericKeys = ['bridged', 'decimal'];
    for (const key of numericKeys) {
      query = query.replaceAll(`"sub".${key}`, `CAST("sub".${key} AS BIGINT)`);
    }
    queryBuilder = queryBuilder.where(query);
  }

  if (sort) {
    queryBuilder = queryBuilder.orderBy(sort.key, sort.order);
  }

  if (pagination?.offset) queryBuilder.offset(pagination.offset);
  if (pagination?.limit) queryBuilder.limit(pagination.limit);

  const rawItems = await queryBuilder.getRawMany<any>();
  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items,
    total: rawItems[0]?.total ?? 0,
  };
};
