import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { Network } from '@rosen-ui/types';
import { DataSource, Repository } from 'typeorm';

import { BridgedAssetEntity } from './BridgedAssetEntity';

class BridgedAssetModel {
  protected readonly bridgedAssetRepository: Repository<BridgedAssetEntity>;
  protected readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger = new DummyLogger()) {
    this.bridgedAssetRepository = dataSource.getRepository(BridgedAssetEntity);
    this.logger = logger;
  }

  /**
   * Upsert an asset with specified information
   * @param asset
   */
  upsertAsset = async (asset: BridgedAssetEntity) => {
    await this.bridgedAssetRepository.save(asset);
    this.logger.debug(
      `Asset [${JsonBigInt.stringify(asset)}] upserted in database`,
    );
  };

  /**
   * Return all stored asset primary keys (tokenId+chain combination)
   */
  getAllStoredAssets = async (): Promise<
    { tokenId: string; chain: Network }[]
  > => {
    return (
      await this.bridgedAssetRepository.find({ select: ['chain', 'tokenId'] })
    ).map((asset) => ({ tokenId: asset.tokenId, chain: asset.chain }));
  };

  /**
   * Remove old unused assets from the database
   * @param assetIds
   */
  removeAssets = async (assets: { tokenId: string; chain: Network }[]) => {
    await Promise.all(
      assets.map(async (asset) =>
        this.bridgedAssetRepository.delete({
          tokenId: asset.tokenId,
          chain: asset.chain,
        }),
      ),
    );
    assets.length &&
      this.logger.debug(
        `Deleted assets ${JsonBigInt.stringify(assets)} from database`,
      );
  };
}

export { BridgedAssetModel };
