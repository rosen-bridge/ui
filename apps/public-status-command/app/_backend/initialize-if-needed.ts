import { dataSource } from '@rosen-bridge/public-status-logic';

if (!dataSource.isInitialized) {
  await dataSource.initialize();
  await dataSource.runMigrations();
}
