import { DataSource } from '@rosen-bridge/extended-typeorm';

import { AggregatedStatusChangedEntity } from '../../../src/db/entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from '../../../src/db/entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from '../../../src/db/entities/GuardStatusEntity';
import { TxEntity } from '../../../src/db/entities/TxEntity';
import migrations from '../../../src/db/migrations';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [
    AggregatedStatusEntity,
    AggregatedStatusChangedEntity,
    GuardStatusEntity,
    GuardStatusChangedEntity,
    TxEntity,
  ],
  migrations: migrations['sqlite'],
  synchronize: false,
  logging: false,
});
