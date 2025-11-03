import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { BridgedAssetEntity } from '../entities';

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
}
