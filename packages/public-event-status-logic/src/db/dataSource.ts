/* global process */
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from './entities/OverallStatusChangedEntity';
import { TxEntity } from './entities/TxEntity';
import migrations from './migrations';

function getString(key: string): string {
  if (!process.env[key]) throw new Error(`env variable ${key} not found`);
  return process.env[key]!;
}

export const config = {
  postgresUrl: getString('POSTGRES_URL'),
  postgresUseSSL: getString('POSTGRES_USE_SSL') === 'true',
};

export const dataSource = new DataSource({
  type: 'postgres',
  url: config.postgresUrl,
  ssl: config.postgresUseSSL,
  entities: [OverallStatusChangedEntity, GuardStatusChangedEntity, TxEntity],
  migrations: [...migrations.postgres],
  synchronize: false,
  logging: false,
});
