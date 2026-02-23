import { testDataSource } from '@rosen-ui/data-source';

export const createDatabase = async () => {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
    await testDataSource.runMigrations();
  }
  return testDataSource;
};
