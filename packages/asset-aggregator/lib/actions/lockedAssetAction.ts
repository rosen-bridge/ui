import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { LockedAssetEntity } from '../entities';
import { TokenAddressInfoType } from '../types';

export class LockedAssetAction {
  protected readonly repository: Repository<LockedAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(LockedAssetEntity);
  }

  /**
   * Stores one or more locked assets in the database
   * @param assets - Single LockedAssetEntity or array of LockedAssetEntity objects to store
   * @returns Promise that resolves when all assets are saved
   */
  store = async (assets: LockedAssetEntity[] | LockedAssetEntity) => {
    if (!(assets instanceof Array)) assets = [assets];
    await this.repository.save(assets);
    this.logger.debug(
      `Locked-assets [${JsonBigInt.stringify(assets)}] stored in database`,
    );
  };

  /**
   * Retrieves all locked assets from the database
   * @returns Promise that resolves to an array of objects containing address and tokenId information
   */
  getAll = async () => {
    return await this.repository.find({ select: ['address', 'tokenId'] });
  };

  /**
   * Removes one or more locked assets from the database
   * @param assets - Single TokenAddressInfoType or array of TokenAddressInfoType objects to delete
   * @returns Promise that resolves when all assets are deleted
   */
  remove = async (assets: TokenAddressInfoType[] | TokenAddressInfoType) => {
    if (!(assets instanceof Array)) assets = [assets];
    await Promise.all(
      assets.map(async (asset) =>
        this.repository.delete({
          tokenId: asset.tokenId,
          address: asset.address,
        }),
      ),
    );
    assets.length &&
      this.logger.debug(
        `Deleted locked-assets ${JsonBigInt.stringify(assets)} from database`,
      );
  };
}
