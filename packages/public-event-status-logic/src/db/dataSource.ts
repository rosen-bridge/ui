/* global process */
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { StatusChangedEntity } from './entities/StatusChangedEntity';
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
  entities: [StatusChangedEntity, GuardStatusChangedEntity],
  migrations: [...migrations.postgres],
  synchronize: false,
  logging: false,
});
