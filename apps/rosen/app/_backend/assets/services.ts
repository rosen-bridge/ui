import {
  AssetFilters,
  getAsset as getAssetCore,
  getAssets as getAssetsCore,
} from './repository';

/**
 * return asset details
 * @param offset
 * @param limit
 */
export const getAsset = async (id: string) => {
  const assetDetails = await getAssetCore(id);

  return {
    token: assetDetails.token,
    locked: assetDetails.locked.map((lockedItem) => ({
      address: lockedItem.address,
      amount: lockedItem.amount.toString(),
    })),
    bridged: assetDetails.bridged.map((bridgedItem) => ({
      chain: bridgedItem.chain,
      amount: bridgedItem.amount.toString(),
    })),
  };
};

/**
 * return assets
 * @param offset
 * @param limit
 */
export const getAssets = async (
  offset: number,
  limit: number,
  filters: AssetFilters = {},
) => {
  const assets = await getAssetsCore(offset, limit, filters);

  return {
    total: assets.total,
    items: assets.items.map((asset) => ({
      ...asset,
      id: asset.isNative ? asset.name : asset.id,
    })),
  };
};
