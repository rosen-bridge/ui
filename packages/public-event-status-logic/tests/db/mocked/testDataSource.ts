import { DataSource } from '@rosen-bridge/extended-typeorm';

import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from '../../../src/db/entities/OverallStatusChangedEntity';
import { TxEntity } from '../../../src/db/entities/TxEntity';
import migrations from '../../../src/db/migrations';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [OverallStatusChangedEntity, GuardStatusChangedEntity, TxEntity],
  migrations: migrations['sqlite'],
  synchronize: false,
  logging: false,
});
