import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { LockedAssetEntity } from '../entities';

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
}
