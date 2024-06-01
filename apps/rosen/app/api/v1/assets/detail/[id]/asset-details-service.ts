import * as assetDetailsRepository from './asset-details-repository';

/**
 * return asset details
 * @param offset
 * @param limit
 */
const getAssetDetails = async (id: string) => {
  const assetDetails = await assetDetailsRepository.getAssets(id);

  return assetDetails;
};

const assetDetailsService = {
  getAssetDetails,
};

export default assetDetailsService;
