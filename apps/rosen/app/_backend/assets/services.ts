import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokens } from '@/_backend/utils';

import {
  AssetFilters,
  getAsset as repositoryGetAsset,
  getAllAssets as repositoryGetAllAssets,
} from './repository';

const tokenMap = new TokenMap(getRosenTokens());

/**
 * return asset details
 * @param offset
 * @param limit
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
 * @param offset
 * @param limit
 */
export const getAllAssets = async (
  offset: number,
  limit: number,
  filters: AssetFilters = {},
) => {
  const assets = await repositoryGetAllAssets(offset, limit, filters);

  return {
    total: assets.total,
    items: assets.items.map((asset) => ({
      ...asset,
      significantDecimals: tokenMap.getSignificantDecimals(asset.id) || 0,
    })),
  };
};
