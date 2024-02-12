import { DataSource, In, Repository } from 'typeorm';

import { AssetEntity } from './asset-entity';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

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
      return this.assetRepository.update({ id: asset.id }, asset);
    } else {
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
    return this.assetRepository.delete({ id: In(assetIds) });
  };
}

export { AssetModel };
