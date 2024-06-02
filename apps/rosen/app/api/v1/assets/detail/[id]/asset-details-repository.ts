import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-calculator';

import dataSource from '@/_backend/dataSource';
import NotFoundError from '@/_errors/NotFoundError';

const bridgedAssetRepository = dataSource.getRepository(BridgedAssetEntity);
const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);

/**
 * get details of an asset, including its token info, plus locked and bridged
 * data
 * @param id
 */
export const getAssets = async (id: string) => {
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
