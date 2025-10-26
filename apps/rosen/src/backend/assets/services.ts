import { Filters } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';

import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import {
  getAsset as repositoryGetAsset,
  getAllAssets as repositoryGetAllAssets,
} from './repository';

/**
 * return asset details
 * @param id
 */
export const getAsset = async (id: string) => {
  const assetDetails = await repositoryGetAsset(id);

  return {
    token: assetDetails.token,
    locked: assetDetails.locked.map((lockedItem) => ({
      address: lockedItem.address,
      amount: lockedItem.amount.toString(),
    })),
    bridged: assetDetails.bridged.map((bridgedItem) => ({
      chain: bridgedItem.chain,
      amount: bridgedItem.amount.toString(),
      birdgedTokenId: bridgedItem.bridgedTokenId,
    })),
  };
};

/**
 * return assets
 * @param filters
 */
export const getAllAssets = async (filters: Filters) => {
  const tokenMap = await getTokenMap();

  const assets = await repositoryGetAllAssets(filters);

  return {
    total: assets.total,
    items: assets.items.map((asset) => ({
      ...asset,
      significantDecimals: tokenMap.getSignificantDecimals(asset.id) || 0,
    })),
  };
};
