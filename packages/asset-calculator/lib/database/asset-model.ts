import { DataSource, In, Repository } from 'typeorm';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { AssetEntity } from './asset-entity';

class AssetModel {
  protected readonly assetRepository: Repository<AssetEntity>;
  protected readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger = new DummyLogger()) {
    this.assetRepository = dataSource.getRepository(AssetEntity);
    this.logger = logger;
  }

  /**
   * Update an asset with specified information
   * Insert the asset if its not already saved in the database
   * @param asset
   */
  updateAsset = async (asset: AssetEntity) => {
    const savedAsset = await this.assetRepository.findOne({
      where: { id: asset.id },
    });
    if (savedAsset) {
      this.logger.debug(
        `Updated asset [${JsonBigInt.stringify(asset)}] in database`
      );
      return this.assetRepository.update({ id: asset.id }, asset);
    } else {
      this.logger.debug(
        `Inserted asset [${JsonBigInt.stringify(asset)}] in database`
      );
      return this.assetRepository.insert(asset);
    }
  };

  /**
   * Return all stored asset ids
   */
  getAllStoredAssets = async (): Promise<string[]> => {
    return (await this.assetRepository.find({ select: ['id'] })).map(
      (asset) => asset.id
    );
  };

  /**
   * Remove old unused assets from the database
   * @param assetIds
   */
  removeUnusedAssets = async (assetIds: string[]) => {
    await this.assetRepository.delete({ id: In(assetIds) });
    this.logger.debug(`Deleted assets ${assetIds} in database`);
  };
}

export { AssetModel };
