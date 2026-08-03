import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { BridgedAssetEntity } from '../entities';
import { AbstractAssetAction } from './abstractAssetAction';

export class BridgedAssetAction extends AbstractAssetAction<BridgedAssetEntity> {
  protected readonly repository: Repository<BridgedAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    super(dataSource, logger);
    this.repository = dataSource.getRepository(BridgedAssetEntity);
  }
}
