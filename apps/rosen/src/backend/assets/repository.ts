import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import {
  AssetViewEntity,
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
const assetViewRepository = dataSource.getRepository(AssetViewEntity);

export interface Asset {
  id: string;
  name: string;
  decimal: number;
  isNative: boolean;
  bridged: string | null;
  lockedPerAddress?: Array<{ amount: number; address: string }>;
  chain: Network;
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
  if (filters.search) {
    filters.search.in ||= [];
  }

  if (!filters.sorts.length) {
    filters.sorts.push({
      key: 'name',
      order: 'ASC',
    });
  }
 
  const options = filtersToTypeorm<AssetViewEntity>(filters);

  const [items, total] = await assetViewRepository.findAndCount(options);

  return {
    items,
    total,
  };
};
