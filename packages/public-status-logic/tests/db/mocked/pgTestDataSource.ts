import { DataSource } from 'typeorm';

import { AggregatedStatusChangedEntity } from '../../../src/db/entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from '../../../src/db/entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from '../../../src/db/entities/GuardStatusEntity';
import { TxEntity } from '../../../src/db/entities/TxEntity';
import migrations from '../../../src/db/migrations';

const getString = (key: string): string => {
  if (!process.env[key]) throw new Error(`env variable ${key} not found`);
  return process.env[key]!;
};

export const pgTestDataSource = new DataSource({
  type: 'postgres',
  url: getString('POSTGRES_URL'),
  ssl: getString('POSTGRES_USE_SSL') === 'true',
  entities: [
    AggregatedStatusEntity,
    AggregatedStatusChangedEntity,
    GuardStatusEntity,
    GuardStatusChangedEntity,
    TxEntity,
  ],
  migrations: migrations.postgres,
  synchronize: false,
  logging: false,
});
