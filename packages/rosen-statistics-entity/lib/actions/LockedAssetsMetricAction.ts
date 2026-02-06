import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { LockedAssetEntity } from '@rosen-ui/asset-calculator';

export class LockedAssetsMetricAction {
  readonly logger: AbstractLogger;

  constructor(
    private readonly dataSource: DataSource,
    logger?: AbstractLogger,
  ) {
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Fetch all locked assets from the database.
   *
   * @returns Promise resolving to an array of LockedAssetEntity
   */
  getLockedAssets = async (): Promise<LockedAssetEntity[]> => {
    return await this.dataSource.getRepository(LockedAssetEntity).find();
  };
}
