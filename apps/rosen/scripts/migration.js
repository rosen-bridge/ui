import { getDataSource } from '@rosen-ui/data-source';

const dataSource = getDataSource(
  process.env.POSTGRES_URL,
  process.env.POSTGRES_USE_SSL === 'true',
  false,
);

await dataSource.initialize();
await dataSource.runMigrations();
