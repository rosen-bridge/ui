import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  ObservationEntity,
  migrations as observationExtractorMigrations,
} from '@rosen-bridge/observation-extractor';
import {
  BlockEntity,
  migrations as scannerMigrations,
} from '@rosen-bridge/scanner';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || 'postgres',
  synchronize: false,
  logging: false,
  entities: [BlockEntity, ObservationEntity],
  migrations: [
    ...observationExtractorMigrations.postgres,
    ...scannerMigrations.postgres,
  ],
});

export default dataSource;
