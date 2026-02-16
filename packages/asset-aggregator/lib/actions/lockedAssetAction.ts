import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { LockedAssetEntity } from '../entities';
import { AbstractAssetAction } from './abstractAssetAction';

export class LockedAssetAction extends AbstractAssetAction<LockedAssetEntity> {
  protected readonly repository: Repository<LockedAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    super(dataSource, logger);
    this.repository = dataSource.getRepository(LockedAssetEntity);
  }
}
