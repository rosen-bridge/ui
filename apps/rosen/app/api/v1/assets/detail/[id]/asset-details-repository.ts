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
  const token: TokenEntity | undefined = await tokenRepository
    .createQueryBuilder()
    .select('*')
    .where({
      id,
    })
    .getRawOne();

  if (!token) {
    throw new NotFoundError(`Token with id [${id}] not found`);
  }

  const bridged: Pick<BridgedAssetEntity, 'amount' | 'chain'>[] =
    await bridgedAssetRepository
      .createQueryBuilder()
      .select(['amount', 'chain'])
      .where({
        tokenId: id,
      })
      .getRawMany();

  const locked: Pick<LockedAssetEntity, 'amount' | 'address'>[] =
    await lockedAssetRepository
      .createQueryBuilder()
      .select(['amount', 'address'])
      .where({
        tokenId: id,
      })
      .getRawMany();

  return {
    token,
    bridged,
    locked,
  };
};
