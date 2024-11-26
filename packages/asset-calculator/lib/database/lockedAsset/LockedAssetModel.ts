import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { DataSource, Repository } from 'typeorm';

import { LockedAssetEntity } from './LockedAssetEntity';

class LockedAssetModel {
  protected readonly lockedAssetRepository: Repository<LockedAssetEntity>;
  protected readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger = new DummyLogger()) {
    this.lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
    this.logger = logger;
  }

  /**
   * Upsert an asset with specified information
   * @param asset
   */
  upsertAsset = async (asset: LockedAssetEntity) => {
    await this.lockedAssetRepository.save(asset);
    this.logger.debug(
      `Asset [${JsonBigInt.stringify(asset)}] upserted in database`,
    );
  };

  /**
   * Return all stored asset primary keys (tokenId+chain combination)
   */
  getAllStoredAssets = async (): Promise<
    { tokenId: string; address: string }[]
  > => {
    return (
      await this.lockedAssetRepository.find({ select: ['address', 'tokenId'] })
    ).map((asset) => ({ tokenId: asset.tokenId, address: asset.address }));
  };

  /**
   * Remove old unused assets from the database
   * @param assetIds
   */
  removeAssets = async (assets: { tokenId: string; address: string }[]) => {
    await Promise.all(
      assets.map(async (asset) =>
        this.lockedAssetRepository.delete({
          tokenId: asset.tokenId,
          address: asset.address,
        }),
      ),
    );
    assets.length &&
      this.logger.debug(
        `Deleted assets ${JsonBigInt.stringify(assets)} from database`,
      );
  };
}

export { LockedAssetModel };
