import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
  migrations,
} from '../lib/database';

export default new DataSource({
  type: 'postgres',
  entities: [
    BridgedAssetEntity,
    LockedAssetEntity,
    TokenEntity,
  ],
  migrations: [
    ...migrations.postgres,
  ],
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'asset_aggregation',
  synchronize: false,
  logging: false,
});
