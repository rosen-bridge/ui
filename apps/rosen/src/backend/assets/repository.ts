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
 * @param offset
 * @param limit
 * @param filters
 */
export const getAllAssets = async (
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
      'chain',
      'count(*) over() AS total',
    ])
    .where(filters)
    .orderBy('name', 'ASC')
    .offset(offset)
    .limit(limit)
    .getRawMany();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = rawItems.map(({ total, ...item }) => item);

  const total = rawItems[0]?.total ?? 0;

  return {
    items,
    total,
  };
};
