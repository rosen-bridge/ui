import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { BridgedAssetEntity } from '../entities';
import { TokenChainInfoType } from '../types';

export class BridgedAssetAction {
  protected readonly repository: Repository<BridgedAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(BridgedAssetEntity);
  }

  /**
   * Stores one or more bridged assets in the database
   * @param assets - Single BridgedAssetEntity or array of BridgedAssetEntity objects to store
   * @returns Promise that resolves when all assets are saved
   */
  store = async (assets: BridgedAssetEntity[] | BridgedAssetEntity) => {
    if (!(assets instanceof Array)) assets = [assets];
    await this.repository.save(assets);
    this.logger.debug(
      `Bridged-assets [${JsonBigInt.stringify(assets)}] stored in database`,
    );
  };

  /**
   * Retrieves all bridged assets from the database
   * @returns Promise that resolves to an array of BridgedAssetEntity objects
   */
  getAll = async (): Promise<BridgedAssetEntity[]> => {
    return await this.repository.find({ select: ['chain', 'tokenId'] });
  };

  /**
   * Removes one or more bridged assets from the database
   * @param assets - Single object or array of objects containing tokenId and chain information to delete
   * @returns Promise that resolves when all assets are deleted
   */
  remove = async (assets: TokenChainInfoType[] | TokenChainInfoType) => {
    if (!(assets instanceof Array)) assets = [assets];
    await Promise.all(
      assets.map(async (asset) =>
        this.repository.delete({
          tokenId: asset.tokenId,
          chain: asset.chain,
        }),
      ),
    );
    assets.length &&
      this.logger.debug(
        `Deleted bridged-assets ${JsonBigInt.stringify(assets)} from database`,
      );
  };
}
