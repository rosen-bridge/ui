import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-calculator';

import NotFoundError from '@/_errors/NotFoundError';

import dataSource from '../dataSource';

const bridgedAssetRepository = dataSource.getRepository(BridgedAssetEntity);
const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);

export interface Asset {
  id: string;
  name: string;
  decimal: number;
  isNative: boolean;
  bridged: string;
  locked: string;
  chain: string;
}

export type AssetFilters = Partial<Pick<Asset, 'chain' | 'name' | 'id'>>;

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
    throw new NotFoundError(`Token with id [${id}] not found`);
  }

  const bridged: Pick<BridgedAssetEntity, 'amount' | 'chain'>[] =
    await bridgedAssetRepository.find({
      where: { tokenId: id },
      select: ['amount', 'chain'],
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

  const items = rawItems.map(({ total, ...item }) => item);

  const total = rawItems[0]?.total ?? 0;

  return {
    items,
    total,
  };
};
