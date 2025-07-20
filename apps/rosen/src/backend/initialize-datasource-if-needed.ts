import { dataSource } from './dataSource';

if (!dataSource.isInitialized) {
  await dataSource.initialize();
  await dataSource.runMigrations();
}
