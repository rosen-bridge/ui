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
  ergoSideTokenId: string;
}

interface AssetWithTotal extends Asset {
  total: number;
}

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
  if (!filters.sort) {
    filters.sort = {
      key: 'name',
      order: 'ASC',
    };
  }

  if (filters.search) {
    filters.search.in ||= [];
  }

  let { pagination, query, sort } = filtersToTypeorm(filters, (key) => {
    switch (key) {
      case 'bridged':
        return `sub."${key}Normalized"`;
      default:
        return `sub."${key}"`;
    }
  });

  const subquery = tokenRepository
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
      'id',
      'name',
      'decimal',
      '"isNative"',
      '"bridged"',
      '"lockedPerAddress"',
      '"ergoSideTokenId"',
      'chain',
      '(CAST(bridged AS NUMERIC) / POWER(10, COALESCE("significantDecimal", 0))) AS "bridgedNormalized"',
      'count(*) over() AS total',
    ])
    .where('te."isResident" = true');

  let queryBuilder = dataSource
    .createQueryBuilder()
    .select(['sub.*', 'COUNT(*) OVER() AS "total"'])
    .from(`(${subquery.getQuery()})`, 'sub')
    .setParameters(subquery.getParameters());

  if (query) {
    queryBuilder = queryBuilder.where(query);
  }

  if (sort) {
    queryBuilder = queryBuilder.orderBy(sort.key, sort.order);
  }

  if (pagination?.offset) {
    queryBuilder = queryBuilder.offset(pagination.offset);
  }

  if (pagination?.limit) {
    queryBuilder = queryBuilder.limit(pagination.limit);
  }

  const rawItems = await queryBuilder.getRawMany<AssetWithTotal>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items,
    total: rawItems[0]?.total ?? 0,
  };
};
