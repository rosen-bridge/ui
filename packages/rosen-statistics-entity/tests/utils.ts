import { DataSource } from '@rosen-bridge/extended-typeorm';

import { MetricEntity, migrations as statisticsMigrations } from '../lib';

export const createDatabase = async () => {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [MetricEntity],
    migrations: [...statisticsMigrations.sqlite],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
