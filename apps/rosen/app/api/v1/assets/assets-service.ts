import * as assetsRepository from './assets-repository';

/**
 * return assets
 * @param offset
 * @param limit
 */
const getAssets = async (
  offset: number,
  limit: number,
  filters: assetsRepository.AssetFilters = {},
) => {
  const assets = await assetsRepository.getAssets(offset, limit, filters);

  return {
    total: assets.total,
    items: assets.items.map((asset) => ({
      ...asset,
      id: asset.isNative ? asset.name : asset.id,
    })),
  };
};

const eventService = {
  getAssets,
};

export default eventService;
