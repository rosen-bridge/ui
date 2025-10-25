import { DataSource } from '@rosen-bridge/extended-typeorm';

import { migrations } from '../lib';
import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '../lib/entities';

/**
 * generate dataSource and related database for tests
 */
export const createDatabase = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    dropSchema: true,
    entities: [BridgedAssetEntity, LockedAssetEntity, TokenEntity],
    migrations: [...migrations.sqlite],
    synchronize: false,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  return dataSource;
};
