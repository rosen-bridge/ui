import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockEntity, migrations } from '@rosen-bridge/scanner';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || 'postgres',
  synchronize: false,
  logging: false,
  entities: [BlockEntity],
  migrations: migrations.postgres,
});

export default dataSource;
