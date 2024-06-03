import * as assetDetailsRepository from './asset-details-repository';

/**
 * return asset details
 * @param offset
 * @param limit
 */
const getAssetDetails = async (id: string) => {
  const assetDetails = await assetDetailsRepository.getAssets(id);

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

const assetDetailsService = {
  getAssetDetails,
};

export default assetDetailsService;
