import dataSource from '@/_backend/dataSource';

if (!dataSource.isInitialized) {
  await dataSource.initialize();
  await dataSource.runMigrations();
}
